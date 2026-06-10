// ============================================================
// Question 3: Concurrent File Processing Pipeline
// Concepts: Pipelines, Fan-Out, Fan-In, Worker Pools, Context
//           Cancellation, Channel Closing, Goroutine Leak
//           Prevention, Ordering, WaitGroups, Metrics
// ============================================================

package main

import (
	"context"
	"fmt"
	"math/rand"
	"sort"
	"sync"
	"sync/atomic"
	"time"
)

// ---------------------------------------------------------------
// Data model — every record carries its original sequence number
// so we can restore ordering at the end (Rule 4).
// ---------------------------------------------------------------

// RawFile is produced by the Reader stage.
type RawFile struct {
	Index   int    // original position in the 10,000-file slice
	Name    string
	Content string // raw bytes (simulated as a string here)
}

// ParsedFile is produced by the Parser stage.
type ParsedFile struct {
	Index    int
	Name     string
	Parsed   map[string]string // key/value pairs extracted from content
}

// ValidatedFile is produced by the Validator stage.
type ValidatedFile struct {
	Index  int
	Name   string
	Parsed map[string]string
}

// StoredFile is produced by the Writer stage — the final output.
type StoredFile struct {
	Index  int
	Name   string
	Status string // "stored"
}

// ValidationError is sent to the error pipeline when validation fails.
type ValidationError struct {
	Index int
	Name  string
	Err   error
}

// ---------------------------------------------------------------
// Metrics — atomic counters, safe for concurrent updates
// ---------------------------------------------------------------

type PipelineMetrics struct {
	FilesRead      int64
	FilesParsed    int64
	FilesValidated int64
	FilesStored    int64
	ParseErrors    int64
	ValidateErrors int64
}

// ---------------------------------------------------------------
// Stage 1: Read — 10 readers in parallel
// ---------------------------------------------------------------
//
// readStage fans OUT across `numReaders` goroutines, each reading
// files and sending RawFile records downstream.
// The stage CLOSES its output channel when all readers are done —
// this is the "done signal" that propagates through the pipeline.

const (
	numReaders    = 10
	numParsers    = 20
	numValidators = 15
	numWriters    = 5
	totalFiles    = 10_000 // Rule: 10,000 files
)

// readStage creates one input channel and fans out to numReaders workers.
// Each worker reads files and sends to the returned channel.
// It closes the output channel when all readers finish.
func readStage(ctx context.Context, files []string, metrics *PipelineMetrics) <-chan RawFile {
	out := make(chan RawFile, numReaders*10) // buffered to smooth bursts

	var wg sync.WaitGroup

	// Distribute file names via a work channel so workers pull greedily
	// instead of pre-assigning fixed slices (better load balancing).
	workCh := make(chan struct {
		idx  int
		name string
	}, len(files))

	// Fill work channel upfront (non-blocking since it's buffered).
	for i, f := range files {
		workCh <- struct {
			idx  int
			name string
		}{i, f}
	}
	close(workCh) // no more work items — readers drain and exit

	for i := 0; i < numReaders; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for item := range workCh {
				// Check for cancellation at the start of each iteration.
				// This avoids processing after shutdown (Rule 2).
				select {
				case <-ctx.Done():
					return
				default:
				}

				// Simulate disk read latency (0–5ms).
				time.Sleep(time.Duration(rand.Intn(5)) * time.Millisecond)

				raw := RawFile{
					Index:   item.idx,
					Name:    item.name,
					Content: fmt.Sprintf("raw-content-of-%s", item.name),
				}

				atomic.AddInt64(&metrics.FilesRead, 1)

				// Send downstream; also listen for ctx so we don't
				// block forever if the next stage is backed up and
				// a shutdown is requested.
				select {
				case out <- raw:
				case <-ctx.Done():
					return
				}
			}
		}(i)
	}

	// Close output channel once ALL readers are done.
	// Must be in a separate goroutine so we don't block the caller.
	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

// ---------------------------------------------------------------
// Stage 2: Parse — 20 parsers in parallel
// ---------------------------------------------------------------
//
// parseStage fans OUT by launching numParsers workers all reading
// from the same `in` channel (fan-out).  Each parsed result goes
// to a single output channel (implicit fan-in by the shared channel).

func parseStage(ctx context.Context, in <-chan RawFile, metrics *PipelineMetrics) <-chan ParsedFile {
	out := make(chan ParsedFile, numParsers*10)

	var wg sync.WaitGroup

	for i := 0; i < numParsers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for raw := range in { // range over channel — exits when `in` is closed
				select {
				case <-ctx.Done():
					return
				default:
				}

				// Simulate parse work (1–10ms).
				time.Sleep(time.Duration(1+rand.Intn(10)) * time.Millisecond)

				parsed := ParsedFile{
					Index: raw.Index,
					Name:  raw.Name,
					Parsed: map[string]string{
						"source": raw.Content,
						"parsed": "true",
					},
				}

				atomic.AddInt64(&metrics.FilesParsed, 1)

				select {
				case out <- parsed:
				case <-ctx.Done():
					return
				}
			}
		}(i)
	}

	go func() {
		wg.Wait()
		close(out)
	}()

	return out
}

// ---------------------------------------------------------------
// Stage 3: Validate — 15 validators + error pipeline
// ---------------------------------------------------------------
//
// validateStage has TWO output channels:
//  - validOut: files that passed validation → goes to Writer
//  - errOut:   files that failed validation → goes to error pipeline
//
// This is the "error pipeline" branch described in Rule 1.

func validateStage(
	ctx context.Context,
	in <-chan ParsedFile,
	metrics *PipelineMetrics,
) (<-chan ValidatedFile, <-chan ValidationError) {

	validOut := make(chan ValidatedFile, numValidators*10)
	errOut := make(chan ValidationError, numValidators*10)

	var wg sync.WaitGroup

	for i := 0; i < numValidators; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for parsed := range in {
				select {
				case <-ctx.Done():
					return
				default:
				}

				// Simulate validation (1–5ms).
				time.Sleep(time.Duration(1+rand.Intn(5)) * time.Millisecond)

				// 10% of files fail validation (simulated rule).
				if rand.Float32() < 0.10 {
					atomic.AddInt64(&metrics.ValidateErrors, 1)

					verr := ValidationError{
						Index: parsed.Index,
						Name:  parsed.Name,
						Err:   fmt.Errorf("validation failed: missing required field"),
					}
					select {
					case errOut <- verr:
					case <-ctx.Done():
						return
					}
					continue // do NOT forward to validOut
				}

				atomic.AddInt64(&metrics.FilesValidated, 1)

				v := ValidatedFile{
					Index:  parsed.Index,
					Name:   parsed.Name,
					Parsed: parsed.Parsed,
				}
				select {
				case validOut <- v:
				case <-ctx.Done():
					return
				}
			}
		}(i)
	}

	go func() {
		wg.Wait()
		close(validOut)
		close(errOut) // both channels closed together
	}()

	return validOut, errOut
}

// ---------------------------------------------------------------
// Stage 4: Write — 5 writers
// ---------------------------------------------------------------
//
// writeStage is the terminal stage.  It collects StoredFile records
// into a slice (in any order) then sorts by Index before returning,
// preserving the original file ordering (Rule 4).

func writeStage(
	ctx context.Context,
	in <-chan ValidatedFile,
	metrics *PipelineMetrics,
) []StoredFile {

	// resultCh collects outputs from all writer goroutines.
	resultCh := make(chan StoredFile, numWriters*10)

	var wg sync.WaitGroup

	for i := 0; i < numWriters; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for v := range in {
				select {
				case <-ctx.Done():
					return
				default:
				}

				// Simulate a DB write or S3 upload (5–20ms).
				time.Sleep(time.Duration(5+rand.Intn(15)) * time.Millisecond)

				atomic.AddInt64(&metrics.FilesStored, 1)

				select {
				case resultCh <- StoredFile{
					Index:  v.Index,
					Name:   v.Name,
					Status: "stored",
				}:
				case <-ctx.Done():
					return
				}
			}
		}(i)
	}

	// Close resultCh when all writers are done so we can range over it.
	go func() {
		wg.Wait()
		close(resultCh)
	}()

	// Collect all results.
	var results []StoredFile
	for r := range resultCh {
		results = append(results, r)
	}

	// Sort by original Index to restore ordering (Rule 4).
	// This is O(n log n) but happens AFTER all processing — it doesn't
	// slow the pipeline itself.
	sort.Slice(results, func(i, j int) bool {
		return results[i].Index < results[j].Index
	})

	return results
}

// ---------------------------------------------------------------
// Error pipeline — drain validation errors concurrently
// ---------------------------------------------------------------
//
// Running the error handler as a separate goroutine means it
// never blocks the main pipeline (Rule 1 — independent stages).

func drainErrors(ctx context.Context, errCh <-chan ValidationError) <-chan []ValidationError {
	// Return a channel that eventually holds all collected errors.
	done := make(chan []ValidationError, 1)

	go func() {
		var errs []ValidationError
		for {
			select {
			case e, ok := <-errCh:
				if !ok {
					// Channel closed — all errors collected.
					done <- errs
					return
				}
				errs = append(errs, e)
			case <-ctx.Done():
				// Collect whatever arrived before cancellation.
				done <- errs
				return
			}
		}
	}()

	return done
}

// ---------------------------------------------------------------
// RunPipeline — wires all stages together
// ---------------------------------------------------------------
//
// The pipeline wiring is intentionally done in ONE place so the
// data-flow graph is easy to read:
//
//   files → readStage → parseStage → validateStage ──┬→ writeStage → []StoredFile
//                                                     └→ drainErrors → []ValidationError

func RunPipeline(ctx context.Context, fileNames []string) ([]StoredFile, []ValidationError, *PipelineMetrics) {
	metrics := &PipelineMetrics{}

	// Stage 1: Read (10 goroutines)
	rawCh := readStage(ctx, fileNames, metrics)

	// Stage 2: Parse (20 goroutines)
	parsedCh := parseStage(ctx, rawCh, metrics)

	// Stage 3: Validate (15 goroutines) — two output channels
	validCh, errCh := validateStage(ctx, parsedCh, metrics)

	// Error pipeline — runs concurrently with writeStage.
	errDone := drainErrors(ctx, errCh)

	// Stage 4: Write (5 goroutines) — blocks until all writes complete.
	stored := writeStage(ctx, validCh, metrics)

	// Wait for error collector to finish (it closed when errCh closed).
	validationErrors := <-errDone

	return stored, validationErrors, metrics
}

// ---------------------------------------------------------------
// main
// ---------------------------------------------------------------

func main() {
	rand.Seed(time.Now().UnixNano())

	// Build the list of 10,000 fake file names.
	fileNames := make([]string, totalFiles)
	for i := range fileNames {
		fileNames[i] = fmt.Sprintf("file-%05d.dat", i)
	}

	// Root context — in production this comes from the HTTP request
	// or a signal handler (Ctrl+C cancels it, stopping the pipeline).
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Demonstrate cancellation: cancel after 3 seconds.
	// Comment this out to process all 10,000 files.
	// go func() {
	//     time.Sleep(3 * time.Second)
	//     fmt.Println("[demo] cancelling context after 3s")
	//     cancel()
	// }()

	fmt.Printf("Starting pipeline with %d files...\n\n", totalFiles)
	start := time.Now()

	stored, errs, metrics := RunPipeline(ctx, fileNames)

	elapsed := time.Since(start)

	// ---- Report ----
	fmt.Printf("=== PIPELINE METRICS ===\n")
	fmt.Printf("Files read      : %d\n", atomic.LoadInt64(&metrics.FilesRead))
	fmt.Printf("Files parsed    : %d\n", atomic.LoadInt64(&metrics.FilesParsed))
	fmt.Printf("Files validated : %d\n", atomic.LoadInt64(&metrics.FilesValidated))
	fmt.Printf("Files stored    : %d\n", atomic.LoadInt64(&metrics.FilesStored))
	fmt.Printf("Validate errors : %d\n", atomic.LoadInt64(&metrics.ValidateErrors))
	fmt.Printf("Elapsed         : %v\n", elapsed)
	fmt.Printf("========================\n")

	fmt.Printf("\nFirst 5 stored files (ordering preserved):\n")
	for i := 0; i < 5 && i < len(stored); i++ {
		fmt.Printf("  [%d] %s → %s\n", stored[i].Index, stored[i].Name, stored[i].Status)
	}

	fmt.Printf("\nFirst 5 validation errors:\n")
	for i := 0; i < 5 && i < len(errs); i++ {
		fmt.Printf("  [%d] %s → %v\n", errs[i].Index, errs[i].Name, errs[i].Err)
	}

	// Verify ordering: every consecutive pair should be Index[i] < Index[i+1].
	ordered := true
	for i := 1; i < len(stored); i++ {
		if stored[i].Index <= stored[i-1].Index {
			ordered = false
			break
		}
	}
	fmt.Printf("\nOutput ordering preserved: %v\n", ordered)
}

// ---------------------------------------------------------------
// Design notes — questions an interviewer might ask
// ---------------------------------------------------------------
//
// Q: How do you prevent goroutine leaks?
// ────────────────────────────────────────
// Every goroutine has an exit path:
//  1. range over an input channel exits when the channel is closed.
//  2. Every send is wrapped in a select with ctx.Done() so a backed-up
//     downstream stage doesn't park a goroutine forever.
//  3. Upstream stages close their output channel via `go func { wg.Wait(); close(ch) }()`.
//     This closure propagates downstream like a wave — each stage's
//     "for range in" loop terminates automatically.
//  4. drainErrors has a ctx.Done() case so it doesn't leak if the
//     pipeline is cancelled before errCh is closed.
//
// Q: How is ordering preserved (Rule 4)?
// ────────────────────────────────────────
// Each record carries its original Index throughout every stage.
// The pipeline processes records out-of-order (that's what makes it fast),
// but writeStage collects everything and sorts by Index at the end.
// Alternative: use a merge-sort (k-way heap) as records arrive to avoid
// the final O(n log n) sort — useful when results must stream out in order.
//
// Q: How do you scale the number of workers per stage?
// ──────────────────────────────────────────────────────
// Each stage's worker count is an independent constant (numReaders=10,
// numParsers=20, etc.).  Profile CPU and I/O: CPU-bound stages (parse)
// benefit from GOMAXPROCS workers; I/O-bound stages (read, write) can
// have many more workers than cores.  Use runtime/pprof or pprof HTTP
// handler in production to find the bottleneck stage.
//
// Q: What's the bottleneck here?
// ────────────────────────────────
// Writers have the fewest workers (5) and the longest simulated latency
// (5-20ms vs 1-10ms for parsing).  In a real system measure channel depth
// at runtime: if validCh is always full, add more writers or batch writes.
//
// Q: How would you handle context cancellation mid-pipeline?
// ───────────────────────────────────────────────────────────
// ctx.Done() cases in every goroutine ensure clean exit.
// The close() wave still propagates because wg.Wait() exits once
// all goroutines return (even early due to ctx.Done()).
// So downstream stages still get closed channels and exit normally —
// no deadlocks, no leaks.