# Golang Concurrency: Concurrent File Processing Pipeline

This guide demonstrates a complete, production-grade concurrent file processing pipeline in Go. It highlights pattern designs such as **Pipelines**, **Fan-Out/Fan-In**, **Worker Pools**, **Context Cancellation**, and **Goroutine Leak Prevention**.

---

## Pipeline Overview

```
 [Input Files] ──> [readStage] ──> [parseStage] ──> [validateStage] ──┬──> [writeStage] ──> [Sorted Output]
                                                                      └──> [drainErrors] ──> [Validation Errors]
```

### Key Rules Implemented:
1. **Independent Stages**: The error handling and writing stages run in separate goroutines so they don't block each other.
2. **Cancellation Handling**: A cancel event instantly stops all workers and avoids processing leftovers.
3. **Ordering**: The original sequence order of the files is preserved at the end.
4. **Metrics**: Real-time stats are safely tracked using atomic counters.

---

## Complete Implementation

Below is the complete, runnable Go code. You can copy it directly into a `main.go` file to execute.

```go
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

// Data model — every record carries its original sequence number
// so we can restore ordering at the end.

type RawFile struct {
	Index   int
	Name    string
	Content string
}

type ParsedFile struct {
	Index  int
	Name   string
	Parsed map[string]string
}

type ValidatedFile struct {
	Index  int
	Name   string
	Parsed map[string]string
}

type StoredFile struct {
	Index  int
	Name   string
	Status string
}

type ValidationError struct {
	Index int
	Name  string
	Err   error
}

type PipelineMetrics struct {
	FilesRead      int64
	FilesParsed    int64
	FilesValidated int64
	FilesStored    int64
	ParseErrors    int64
	ValidateErrors int64
}

const (
	numReaders    = 10
	numParsers    = 20
	numValidators = 15
	numWriters    = 5
	totalFiles    = 10000
)

// readStage creates one input channel and fans out to numReaders workers.
// Each worker reads files and sends to the returned channel.
// It closes the output channel when all readers finish.
func readStage(ctx context.Context, files []string, metrics *PipelineMetrics) <-chan RawFile {
	out := make(chan RawFile, numReaders*10)

	var wg sync.WaitGroup

	workCh := make(chan struct {
		idx  int
		name string
	}, len(files))

	for i, f := range files {
		workCh <- struct {
			idx  int
			name string
		}{i, f}
	}
	close(workCh)

	for i := 0; i < numReaders; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for item := range workCh {
				select {
				case <-ctx.Done():
					return
				default:
				}

				time.Sleep(time.Duration(rand.Intn(5)) * time.Millisecond)

				raw := RawFile{
					Index:   item.idx,
					Name:    item.name,
					Content: fmt.Sprintf("raw-content-of-%s", item.name),
				}

				atomic.AddInt64(&metrics.FilesRead, 1)

				select {
				case out <- raw:
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

// parseStage fans OUT by launching numParsers workers all reading from the same in channel.
func parseStage(ctx context.Context, in <-chan RawFile, metrics *PipelineMetrics) <-chan ParsedFile {
	out := make(chan ParsedFile, numParsers*10)

	var wg sync.WaitGroup

	for i := 0; i < numParsers; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()

			for raw := range in {
				select {
				case <-ctx.Done():
					return
				default:
				}

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

// validateStage has TWO output channels: validOut and errOut.
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

				time.Sleep(time.Duration(1+rand.Intn(5)) * time.Millisecond)

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
					continue
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
		close(errOut)
	}()

	return validOut, errOut
}

// writeStage is the terminal stage. It collects StoredFile records, then sorts by Index.
func writeStage(
	ctx context.Context,
	in <-chan ValidatedFile,
	metrics *PipelineMetrics,
) []StoredFile {

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

	go func() {
		wg.Wait()
		close(resultCh)
	}()

	var results []StoredFile
	for r := range resultCh {
		results = append(results, r)
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Index < results[j].Index
	})

	return results
}

// drainErrors collects all validation errors in the background.
func drainErrors(ctx context.Context, errCh <-chan ValidationError) <-chan []ValidationError {
	done := make(chan []ValidationError, 1)

	go func() {
		var errs []ValidationError
		for {
			select {
			case e, ok := <-errCh:
				if !ok {
					done <- errs
					return
				}
				errs = append(errs, e)
			case <-ctx.Done():
				done <- errs
				return
			}
		}
	}()

	return done
}

// RunPipeline wires all stages together.
func RunPipeline(ctx context.Context, fileNames []string) ([]StoredFile, []ValidationError, *PipelineMetrics) {
	metrics := &PipelineMetrics{}

	rawCh := readStage(ctx, fileNames, metrics)
	parsedCh := parseStage(ctx, rawCh, metrics)
	validCh, errCh := validateStage(ctx, parsedCh, metrics)

	errDone := drainErrors(ctx, errCh)
	stored := writeStage(ctx, validCh, metrics)
	validationErrors := <-errDone

	return stored, validationErrors, metrics
}

func main() {
	rand.Seed(time.Now().UnixNano())

	fileNames := make([]string, totalFiles)
	for i := range fileNames {
		fileNames[i] = fmt.Sprintf("file-%05d.dat", i)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	fmt.Printf("Starting pipeline with %d files...\n\n", totalFiles)
	start := time.Now()

	stored, errs, metrics := RunPipeline(ctx, fileNames)
	elapsed := time.Since(start)

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

	ordered := true
	for i := 1; i < len(stored); i++ {
		if stored[i].Index <= stored[i-1].Index {
			ordered = false
			break
		}
	}
	fmt.Printf("\nOutput ordering preserved: %v\n", ordered)
}
```

---

## Interview Questions & Design Notes

### Q1: How do you prevent goroutine leaks in this pipeline?
Every goroutine in the pipeline is designed with a strict termination path:
1. **Reading from channels**: Goroutines range over their input channels (`for item := range in`). When the previous stage closes its output channel, the loop automatically terminates.
2. **Writing to channels**: Every channel send is wrapped in a `select` statement that listens on both the destination channel and the context cancellation signal (`case <-ctx.Done()`). This guarantees that if a downstream consumer blocks (due to an error or shutdown), upstream workers do not block indefinitely.
3. **Closing channels**: Upstream stages handle closure asynchronously via `go func() { wg.Wait(); close(out) }()`. Once all workers in a stage finish processing, the output channel is closed. This triggers a cascade of terminations downstream.
4. **Error handling**: The `drainErrors` routine has a `case <-ctx.Done()` block to ensure it exits safely even if the context is cancelled before `errCh` closes.

---

### Q2: How is ordering preserved while executing stages concurrently?
To maintain high throughput, the pipeline processes files concurrently and out-of-order. However, to preserve the original sequence of the input:
- Each data structure (`RawFile`, `ParsedFile`, etc.) carries the original sequence `Index`.
- The final terminal stage (`writeStage`) collects all processed records into a slice.
- It then sorts the slice by `Index` using Go's `sort.Slice` before returning them.

> [!NOTE]
> *Alternative*: For streaming systems where memory is tight and output must stream incrementally, a heap-based priority queue (merge-sort) can be used to merge incoming records on the fly.

---

### Q3: How do you scale the number of workers per stage?
Each stage's worker count (`numReaders`, `numParsers`, etc.) is declared as a configurable parameter or constant:
- **CPU-bound tasks** (e.g., JSON parsing): Keep the number of workers close to `runtime.GOMAXPROCS` or CPU cores.
- **I/O-bound tasks** (e.g., file reading, API/DB calls): You can scale worker counts much higher (e.g., dozens or hundreds of workers) to hide network/disk latency.

Use Go's `pprof` tool at runtime to inspect channel queue depths and identify bottlenecks.

---

### Q4: What is the bottleneck in this specific implementation?
The writers have the lowest worker allocation (`numWriters = 5`) and the highest simulated latency ($5\text{ms}$–$20\text{ms}$ vs $1\text{ms}$–$10\text{ms}$ for parsers). In a real environment:
- If the `validCh` channel is consistently full, it confirms the writer is the bottleneck.
- To resolve it, we can increase the writer pool size, configure batch writes, or optimize DB indexes.

---

### Q5: How would you handle context cancellation mid-pipeline?
If a cancellation request occurs (e.g., client cancels the request or an OS interrupt):
1. The cancel signal is propagated down through `ctx.Done()`.
2. Select cases in all active worker goroutines catch the signal and return immediately.
3. Once all workers return, their respective `sync.WaitGroup` completes, triggering the `close(ch)` block.
4. The remaining channels are drained/closed down the line, ensuring a safe, deadlock-free shutdown.