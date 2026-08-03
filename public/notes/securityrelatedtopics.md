# Security Interview Preparation Guide

# Table of Contents

1. Security Fundamentals
2. Authentication
3. Authorization
4. OAuth 2.0
5. OpenID Connect (OIDC)
6. SAML
7. JWT
8. RBAC
9. ABAC
10. MFA / 2FA
11. Session Management
12. API Security
13. Secrets Management
14. Security Architecture Interview Questions
15. Senior Engineer Security Questions

---

# 1. Security Fundamentals

## CIA Triad

Security is built around three pillars:

### Confidentiality

Only authorized people can access data.

Example:

* Password-protected banking account
* Encrypted database

### Integrity

Data cannot be modified by unauthorized users.

Example:

* Digital signatures
* Checksums

### Availability

Systems remain accessible when needed.

Example:

* Load balancers
* Multiple replicas
* DDoS protection

---

## Security Layers

Think of a castle.

```
Internet
    |
Firewall
    |
Load Balancer
    |
API Gateway
    |
Application
    |
Database
```

Even if one layer fails, others protect the system.

This is called:

**Defense in Depth**

---

# 2. Authentication

## What is Authentication?

Authentication answers:

"Who are you?"

Examples:

* Username + Password
* Google Login
* Face ID
* OTP

---

## Real Life Analogy

Entering an airport:

Security asks:

"Show your passport"

Passport proves identity.

Authentication works similarly.

---

## Types

### Knowledge Based

Something you know

* Password
* PIN

### Possession Based

Something you have

* Mobile
* Security Key

### Inherence Based

Something you are

* Fingerprint
* Face Scan

---

## Authentication Flow

```
User
 |
 | Username + Password
 |
 v
Authentication Server
 |
Verify Credentials
 |
Generate Session/JWT
 |
Authenticated
```

---

## Password Storage

Never store:

```
password123
```

Store:

```
hash(password123)
```

Example:

```
bcrypt(password)
argon2(password)
scrypt(password)
```

---

## Common Interview Questions

### Why not store passwords in plain text?

Database leak exposes all accounts.

### Why bcrypt over SHA256?

SHA256 is fast.

Attackers can brute-force quickly.

bcrypt is intentionally slow.

---

# 3. Authorization

## What is Authorization?

Authorization answers:

"What are you allowed to do?"

Example:

User authenticated successfully.

Can they:

* View data?
* Edit data?
* Delete data?

Authorization decides.

---

## Example

```
User: Harsh

Permissions:
✓ Read Orders
✓ Create Orders
✗ Delete Orders
```

---

## Authentication vs Authorization

Authentication:

```
Who are you?
```

Authorization:

```
What can you do?
```

---

## Flow

```
Login
 |
Authentication
 |
Authorization
 |
Access Resource
```

---

# 4. OAuth 2.0

## What Problem Does OAuth Solve?

Without OAuth:

```
Give password to third party app
```

Dangerous.

OAuth allows:

```
Grant access
without sharing password
```

---

## Example

Login with Google

```
App
 |
Redirect
 |
Google
 |
Consent
 |
Authorization Code
 |
Access Token
 |
App Access
```

---

## OAuth Actors

### Resource Owner

User

### Client

Application

### Authorization Server

Google

### Resource Server

Google APIs

---

## Authorization Code Flow

Most important interview topic.

```
User
 |
Login
 |
Google
 |
Authorization Code
 |
Backend
 |
Exchange Code
 |
Access Token
 |
Use API
```

---

## Why Authorization Code Flow?

Access token never exposed directly.

More secure.

---

## Access Token

Short-lived token.

Example:

```
15 mins
30 mins
1 hour
```

---

## Refresh Token

Used to obtain new access token.

Example:

```
Access Token expires
       |
Refresh Token
       |
New Access Token
```

---

## Most Asked OAuth Questions

### Why Authorization Code Flow over Implicit Flow?

More secure.

### Why refresh tokens?

Avoid asking users to login repeatedly.

### What happens if access token leaks?

Short expiry minimizes damage.

---

# 5. OpenID Connect (OIDC)

## What is OIDC?

OAuth handles authorization.

OIDC adds authentication.

Think:

```
OAuth = Access

OIDC = Identity + Access
```

---

## Example

OAuth:

```
Can access Gmail
```

OIDC:

```
Who is Harsh?
Email?
Name?
Profile?
```

---

## ID Token

OIDC introduces:

```
ID Token
```

Usually JWT.

Contains identity information.

Example:

```json
{
  "sub":"123",
  "email":"user@gmail.com"
}
```

---

## Most Asked Questions

### Difference between OAuth and OIDC?

OAuth:
Authorization

OIDC:
Authentication

---

# 6. SAML

## What is SAML?

XML based authentication protocol.

Common in enterprises.

Examples:

* Okta
* Azure AD
* Corporate Login

---

## Analogy

Visitor pass.

Reception verifies identity.

Every department trusts reception.

---

## Components

### Identity Provider (IdP)

Authenticates user.

Examples:

* Okta
* Azure AD

### Service Provider (SP)

Application.

Examples:

* Jira
* Salesforce

---

## Flow

```
User
 |
Application
 |
Redirect
 |
Identity Provider
 |
Authenticate
 |
SAML Assertion
 |
Application
 |
Access
```

---

## SAML vs OIDC

| SAML            | OIDC            |
| --------------- | --------------- |
| XML             | JSON            |
| Enterprise      | Modern Apps     |
| Older           | Newer           |
| Browser Focused | Mobile Friendly |

---

# 7. JWT

## What is JWT?

JSON Web Token

Portable authentication token.

---

## Structure

```
Header.Payload.Signature
```

Example:

```
xxxxx.yyyyy.zzzzz
```

---

## Payload

```json
{
 "sub":"123",
 "role":"admin",
 "exp":123456
}
```

---

## Why Signature?

Detect tampering.

---

## JWT Verification

```
JWT
 |
Verify Signature
 |
Validate Expiry
 |
Authorize User
```

---

## Common Mistakes

### Storing sensitive data

Never store:

* Passwords
* Secrets

Inside JWT.

### No expiration

Huge security risk.

---

## Most Asked Questions

### Can JWT be revoked?

Not easily.

Use:

* Blacklist
* Short expiration
* Refresh tokens

### JWT vs Session?

JWT:
Stateless

Session:
Stateful

---

# 8. RBAC

## Role Based Access Control

Access based on role.

Example:

```
Admin
Manager
Agent
Customer
```

---

## Diagram

```
User
 |
Role
 |
Permissions
```

---

## Example

Admin:

```
Read
Write
Delete
```

User:

```
Read
```

---

## Benefits

Simple.

Easy to manage.

---

## Drawbacks

Role explosion.

Example:

```
Admin_US
Admin_UK
Admin_India
```

Hundreds of roles.

---

# 9. ABAC

## Attribute Based Access Control

Access determined by attributes.

---

## Example

Allow access when:

```
Department = Finance

AND

Country = India

AND

Time < 6PM
```

---

## Diagram

```
User Attributes
+
Resource Attributes
+
Environment Attributes
        |
      Policy
        |
      Decision
```

---

## RBAC vs ABAC

| RBAC       | ABAC            |
| ---------- | --------------- |
| Role Based | Attribute Based |
| Simpler    | Flexible        |
| Easy       | Complex         |

---

## Interview Question

Why ABAC?

Large enterprises require fine-grained access.

---

# 10. MFA / 2FA

## What is MFA?

Multiple authentication factors.

Example:

```
Password
+
OTP
```

---

## Types

### Password

Something you know

### OTP

Something you have

### Biometrics

Something you are

---

## Flow

```
Password
 |
Verified
 |
OTP
 |
Verified
 |
Access
```

---

## Why MFA?

Even if password leaks:

Attacker still needs OTP.

---

## Interview Question

Is SMS OTP secure?

Better than password only.

But vulnerable to SIM swapping.

Authenticator apps are preferred.

---

# 11. Session Management

## Session Based Authentication

Server stores session.

```
User
 |
Session ID
 |
Cookie
 |
Server Session Store
```

---

## Session Lifecycle

```
Login
 |
Create Session
 |
Store Session
 |
Send Cookie
 |
Request
 |
Logout
 |
Destroy Session
```

---

## Session Storage

* Redis
* Database
* In-memory

---

## Session Security

### HttpOnly

JavaScript cannot access cookie.

### Secure

HTTPS only.

### SameSite

Protects against CSRF.

---

## Session vs JWT

### Session

Pros:

* Easy revocation
* More control

Cons:

* Requires storage

### JWT

Pros:

* Stateless
* Scalable

Cons:

* Hard revocation

---

# 12. API Security

## Common Threats

### Broken Authentication

Weak login mechanisms.

### Broken Authorization

User accesses others' resources.

### Injection

SQL Injection

### Rate Abuse

Excessive requests.

---

## Security Controls

### HTTPS Everywhere

Encrypt traffic.

### API Gateway

Centralized protection.

### Rate Limiting

Example:

```
100 requests/min
```

---

## API Key

Simple application identification.

Not user authentication.

---

## Security Headers

```
HSTS
CSP
X-Frame-Options
```

---

## OWASP API Top 10

Know these:

1. Broken Object Level Authorization
2. Broken Authentication
3. Excessive Data Exposure
4. Rate Limiting Issues
5. SSRF
6. Security Misconfiguration
7. Injection
8. Broken Function Level Authorization

---

## Most Asked Questions

How do you secure APIs?

Answer:

* HTTPS
* OAuth/JWT
* Rate limiting
* WAF
* Validation
* Logging
* Monitoring

---

# 13. Secrets Management

## What is a Secret?

Sensitive information.

Examples:

* DB Password
* API Key
* AWS Credentials
* JWT Signing Key

---

## Never

```go
password := "admin123"
```

inside code.

---

## Good Approach

```
Application
 |
Secret Manager
 |
Fetch Secret
```

---

## Tools

* HashiCorp Vault
* AWS Secrets Manager
* Azure Key Vault
* GCP Secret Manager

---

## Secret Rotation

Regularly replace secrets.

Example:

```
Every 90 days
```

---

## Interview Question

Why not store secrets in Git?

Repository leak exposes production systems.

---

# Security Architecture Interview Questions

## Authentication

1. Difference between authentication and authorization?
2. How does JWT work?
3. How would you revoke JWT?
4. Session vs JWT?
5. Why bcrypt?
6. Why Argon2?

---

## OAuth/OIDC

1. Explain OAuth flow.
2. What is Authorization Code Flow?
3. What is PKCE?
4. Difference between OAuth and OIDC?
5. Access token vs Refresh token?
6. Why use refresh tokens?

---

## Authorization

1. RBAC vs ABAC?
2. How would you design permissions for millions of users?
3. How do you prevent privilege escalation?
4. What is least privilege principle?

---

## API Security

1. How do you secure public APIs?
2. Explain rate limiting.
3. How do you prevent replay attacks?
4. How do you prevent CSRF?
5. What is CORS?

---

## Sessions

1. Session fixation attack?
2. Session hijacking?
3. Cookie security flags?
4. Sticky sessions vs Redis sessions?

---

## Secrets

1. How do you manage secrets in Kubernetes?
2. How does Vault work?
3. Secret rotation strategies?
4. How would you rotate DB credentials without downtime?

---

# Senior Engineer Security Questions

### Design authentication for 10 million users.

### Design SSO for multiple applications.

### JWT or Session? Why?

### How would you secure microservice-to-microservice communication?

### How would you implement zero-trust architecture?

### How would you prevent account takeover attacks?

### How would you design fine-grained permissions?

### How would you implement multi-region authentication?

### How would you secure Kafka communication?

### How would you secure internal APIs?

### How would you handle secret rotation across thousands of services?

### How would you secure a public payment API?

---

# 15-Minute Interview Revision

Authentication
Authorization
OAuth
OIDC
SAML
JWT
RBAC
ABAC
MFA
Session
API Security
Secrets Management

Remember:

Authentication = Who are you?

Authorization = What can you do?

OAuth = Delegated Access

OIDC = Identity Layer over OAuth

SAML = Enterprise SSO

JWT = Stateless Token

RBAC = Roles

ABAC = Attributes

MFA = Multiple Factors

Session = Server Stored State

API Security = Protect Endpoints

Secrets Management = Protect Credentials

# Advanced Security Topics (Senior/Staff Engineer Interview Preparation)

---

# PKCE (Proof Key for Code Exchange)

## Why PKCE Exists

Problem:

Authorization Code Flow originally assumed the client could safely store a secret.

Mobile apps and SPAs cannot safely store secrets.

An attacker may intercept the authorization code.

PKCE prevents that.

---

## Flow

```text
Client
 |
Generate:
Code Verifier
Code Challenge
 |
Authorization Server
 |
Authorization Code
 |
Send Authorization Code
+
Original Code Verifier
 |
Validate
 |
Issue Token
```

---

## Analogy

Think of a movie ticket.

Authorization Code = Ticket

Code Verifier = Secret PIN

Stealing ticket alone is useless.

Attacker also needs PIN.

---

## Interview Questions

### Why is PKCE required?

Protects Authorization Code Flow from code interception attacks.

### Is PKCE only for mobile?

No.

Recommended for all OAuth clients including SPAs.

---

# CSRF (Cross Site Request Forgery)

## What Is CSRF?

Tricking a logged-in user into performing unwanted actions.

---

## Example

User logged into bank.

Visits malicious site.

Hidden form submits:

```html
POST /transfer
amount=100000
```

Browser automatically sends session cookie.

Bank thinks request is legitimate.

Money transferred.

---

## Diagram

```text
User Logged In
      |
Malicious Website
      |
Hidden Request
      |
Bank Receives Cookie
      |
Request Executed
```

---

## Prevention

### CSRF Tokens

Server generates unique token.

Request must contain token.

Attacker cannot guess it.

---

### SameSite Cookies

```text
SameSite=Strict
SameSite=Lax
```

Browser won't send cookies in many cross-site requests.

---

### Verify Origin Header

Validate:

```text
Origin
Referer
```

---

## Interview Questions

### Why does JWT often avoid CSRF?

If JWT stored in localStorage and manually attached.

However:

JWT inside cookies can still suffer from CSRF.

---

# CORS (Cross-Origin Resource Sharing)

## Problem

Browser blocks:

```text
frontend.com
     |
     |
api.company.com
```

because origins differ.

---

## What Is An Origin?

```text
Protocol + Domain + Port
```

Example:

```text
https://app.com
https://api.app.com
```

Different origins.

---

## CORS Headers

```http
Access-Control-Allow-Origin
Access-Control-Allow-Headers
Access-Control-Allow-Methods
```

---

## Example

```http
Access-Control-Allow-Origin:
https://app.company.com
```

Only trusted frontend can call API.

---

## Common Mistake

```http
Access-Control-Allow-Origin: *
```

for sensitive APIs.

---

## Interview Questions

### Is CORS a server-side security feature?

No.

It's enforced by browsers.

---

# Cookie Security

---

## HttpOnly

JavaScript cannot read cookie.

Protects against token theft.

```text
document.cookie
```

cannot access it.

---

## Secure

Cookie only sent over HTTPS.

---

## SameSite

Protection against CSRF.

```text
Strict
Lax
None
```

---

## Recommended

```http
Set-Cookie:
HttpOnly
Secure
SameSite=Lax
```

---

# XSS (Cross Site Scripting)

## What Is XSS?

Attacker injects JavaScript into web pages.

---

## Example

Comment field:

```html
<script>
 stealCookie()
</script>
```

---

## Types

### Stored XSS

Saved in database.

---

### Reflected XSS

Returned immediately from request.

---

### DOM XSS

Client-side manipulation.

---

## Prevention

### Output Encoding

```html
&lt;script&gt;
```

instead of:

```html
<script>
```

---

### CSP

Content Security Policy

Restricts executable scripts.

---

## Interview Questions

### Why is HttpOnly useful?

Prevents JavaScript from stealing cookies.

---

# Content Security Policy (CSP)

## Purpose

Reduce XSS impact.

---

## Example

```http
Content-Security-Policy:
script-src 'self'
```

Only scripts from own domain.

---

## Benefits

* Prevent malicious scripts
* Reduce XSS damage
* Restrict third-party resources

---

# Rate Limiting

## Why?

Prevent:

* DDoS
* Brute force attacks
* API abuse

---

## Algorithms

### Fixed Window

```text
100 requests/minute
```

Simple.

---

### Sliding Window

More accurate.

---

### Token Bucket

Most common.

---

## Diagram

```text
Bucket
 |
Tokens
 |
Request consumes token
 |
No token => reject
```

---

## Interview Questions

### Why Token Bucket?

Allows bursts while maintaining average rate.

---

# Replay Attack

## What Is Replay Attack?

Attacker captures valid request.

Replays later.

---

## Example

```text
Transfer ₹1000
```

Captured.

Sent again.

Money transferred twice.

---

## Prevention

### Nonce

Unique request identifier.

---

### Timestamp

Reject old requests.

---

### Request Signing

```text
HMAC
```

Validates integrity.

---

# HMAC (Hash-Based Message Authentication Code)

## Purpose

Verify:

* Integrity
* Authenticity

---

## Example

Sender:

```text
message + secret
```

creates signature.

Receiver recalculates signature.

If match:

Request trusted.

---

## Common Use Cases

* Webhooks
* Internal APIs
* Payment gateways

---

# mTLS (Mutual TLS)

## What Is It?

Normal HTTPS:

Server proves identity.

mTLS:

Both sides prove identity.

---

## Flow

```text
Client Certificate
       |
Server Certificate
       |
Mutual Verification
```

---

## Real Example

Microservice communication.

```text
Payment Service
      |
Inventory Service
```

Both authenticate each other.

---

## Benefits

* Strong identity
* No passwords
* Internal API security

---

## Interview Questions

### OAuth vs mTLS?

OAuth:
User identity.

mTLS:
Machine identity.

---

# Service-to-Service Authentication

## Common Approaches

### API Keys

Simple but weak.

---

### JWT

Most common.

---

### mTLS

Strongest.

---

### SPIFFE/SPIRE

Cloud-native identity.

---

## Example

```text
Order Service
    |
JWT
    |
Inventory Service
```

---

# Zero Trust Architecture

## Traditional Security

```text
Inside Network = Trusted
```

Bad assumption.

---

## Zero Trust

```text
Trust Nobody
Verify Everything
```

---

## Principles

### Verify Explicitly

Authenticate every request.

---

### Least Privilege

Minimum permissions.

---

### Assume Breach

Design as if attackers already entered.

---

## Example

```text
User
 |
MFA
 |
Device Validation
 |
Authorization
 |
Resource
```

---

## Interview Questions

### Core principle?

Never trust based solely on network location.

---

# WAF (Web Application Firewall)

## Purpose

Protect applications.

---

## Blocks

* SQL Injection
* XSS
* Known attack patterns

---

## Placement

```text
Internet
 |
WAF
 |
Load Balancer
 |
Application
```

---

## Popular Solutions

* Cloudflare
* AWS WAF
* Akamai

---

# SQL Injection

## Vulnerable Code

```sql
SELECT *
FROM users
WHERE username='input'
```

Input:

```sql
' OR 1=1 --
```

Query compromised.

---

## Prevention

### Parameterized Queries

```sql
SELECT *
FROM users
WHERE username=?
```

---

## Interview Question

Most effective prevention?

Prepared statements.

---

# OWASP Top 10

Know all of these.

1. Broken Access Control
2. Cryptographic Failures
3. Injection
4. Insecure Design
5. Security Misconfiguration
6. Vulnerable Components
7. Authentication Failures
8. Software Integrity Failures
9. Logging Failures
10. SSRF

---

# SSRF (Server Side Request Forgery)

## Attack

Attacker tricks server into making requests.

Example:

```text
http://169.254.169.254
```

AWS metadata endpoint.

---

## Prevention

* Allow lists
* Network isolation
* Block internal IPs

---

# Secrets Rotation

## Problem

Credentials eventually leak.

---

## Solution

Rotate periodically.

```text
Old Secret
     |
New Secret
     |
Applications Updated
     |
Old Secret Removed
```

---

## Interview Question

How to rotate without downtime?

Use:

```text
Current Secret
+
Next Secret
```

temporarily.

Support both during transition.

---

# Kubernetes Security

## Common Topics

### Secrets

Never commit to Git.

---

### RBAC

Control cluster permissions.

---

### Network Policies

Restrict pod communication.

---

### Pod Security

Prevent privileged containers.

---

### Image Scanning

Detect vulnerabilities.

---

# Security Headers

## Important Headers

```http
Strict-Transport-Security
Content-Security-Policy
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
```

---

# Secure Microservice Architecture

```text
Internet
   |
WAF
   |
API Gateway
   |
Auth Service
   |
Microservices
   |
Database
```

Security Controls:

* TLS everywhere
* mTLS internally
* JWT authentication
* RBAC/ABAC authorization
* Rate limiting
* Audit logging
* Secrets Manager
* WAF
* Monitoring

---

# Senior/Staff Level Security Questions

### Design secure authentication for 100 million users.

### Design SSO across 500 applications.

### OAuth vs Session Authentication?

### JWT revocation strategies?

### How would you secure Kafka?

### How would you secure gRPC?

### How would you secure service-to-service communication?

### How would you design fine-grained authorization?

### How would you implement Zero Trust?

### How would you prevent account takeover?

### How would you secure Kubernetes?

### How would you rotate secrets with zero downtime?

### How would you secure payment APIs?

### How would you detect credential stuffing attacks?

### How would you secure public APIs against abuse?

### How would you secure a multi-tenant SaaS platform?

---

# 30-Second Revision

Authentication → Who are you?

Authorization → What can you do?

OAuth → Delegated access

OIDC → Identity layer

SAML → Enterprise SSO

JWT → Stateless auth

RBAC → Roles

ABAC → Attributes

MFA → Multiple factors

CSRF → Fake requests

CORS → Browser cross-origin control

XSS → Script injection

CSP → Restrict scripts

mTLS → Machine identity

WAF → App firewall

HMAC → Signed requests

Zero Trust → Verify everything

Secrets Manager → Protect credentials

OWASP Top 10 → Most common vulnerabilities
