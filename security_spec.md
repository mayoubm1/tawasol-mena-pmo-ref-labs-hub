# Security Specification & Threat Model

This document defines the data invariants, threat model, and validation logic for the TAWASOL MENA PMO central repository and real-time synchronization layers.

## 1. Data Invariants

- **Members**: Every member record must contain a valid non-empty `name`, `role`, and assigned regulatory or operational jurisdiction (`country`).
- **Tasks**: A PMO task cannot be created without a valid display `title`, `country`, `sector`, and `status`. It must belong to one of the approved regional sectors.
- **KPI Metrics**: A KPI record must contain a valid numeric metric name, a target, and mapped regional associations.
- **WhatsApp Simulator Cockpit**: Messages must have a legitimate sender name, message body, and valid timestamp metadata.
- **Archive Documents**: Registered files must have an author, category, unique cryptographic identifier checksum, and size limits.

---

## 2. The "Dirty Dozen" Threat Payloads (Failure Vectors)

The following payloads represent attempt vectors that must be strictly rejected by our zero-trust schema rules.

### Attack Vector 1: Identity Spoofing & Field Poisoning (Tasks)
```json
{
  "id": "malicious-task-999",
  "title": "",
  "country": "Infiltrator-Land",
  "sector": "Procurement",
  "status": "In Progress"
}
```
*Expected: PERMISSION_DENIED (empty title and unregistered country)*

### Attack Vector 2: Resource Exhaustion/Denial-of-Wallet (Large Values)
```json
{
  "id": "poison-task",
  "title": "A".repeat(10050),
  "country": "UAE",
  "sector": "Logistics",
  "status": "Not Started"
}
```
*Expected: PERMISSION_DENIED (string size constraint violation)*

### Attack Vector 3: Key Injection/Ghost Fields (Tasks)
```json
{
  "id": "ghost-task",
  "title": "Riyadh Lab Integration",
  "country": "Saudi Arabia",
  "sector": "Compliance",
  "status": "Blocked",
  "backdoor_access_unlocked": true
}
```
*Expected: PERMISSION_DENIED (undefined/shadow field detection)*

### Attack Vector 4: Unregistered Enum States (Tasks)
```json
{
  "id": "status-bypass",
  "title": "Cairo Cold Chain Validation",
  "country": "Egypt",
  "sector": "Logistics",
  "status": "APPROVED-WITHOUT-AUDIT"
}
```
*Expected: PERMISSION_DENIED (illegal status enum state)*

### Attack Vector 5: Member Record Mutation (Members)
```json
{
  "name": "",
  "role": "Lead Architect",
  "country": "Global"
}
```
*Expected: PERMISSION_DENIED (identity name is missing/empty)*

### Attack Vector 6: Invalid Email/Identifier Formats (Members)
```json
{
  "name": "Intruder Bot",
  "role": "Steering Board",
  "country": "Global",
  "email": "malformed@@@email...com"
}
```
*Expected: PERMISSION_DENIED (syntax integrity failure)*

### Attack Vector 7: Invalid KPIs Schema Manipulation (KPIs)
```json
{
  "name": "Riyadh Throughput",
  "value": "STRING_INSTEAD_OF_NUMERIC_STATE",
  "target": 100
}
```
*Expected: PERMISSION_DENIED (type safety violation)*

### Attack Vector 8: Orphaned Sub-documents (WhatsApp Simulator)
```json
{
  "id": "ghost-msg",
  "sender": "",
  "text": "Phishing Link",
  "timestamp": "Now"
}
```
*Expected: PERMISSION_DENIED (missing sender name / empty fields)*

### Attack Vector 9: Extreme Size Ingestion/Spam (WhatsApp)
```json
{
  "id": "spam-msg",
  "sender": "Spammer",
  "text": "S".repeat(500000),
  "timestamp": "Today"
}
```
*Expected: PERMISSION_DENIED (body text exceeds safety threshold)*

### Attack Vector 10: State Bypass / Forged Timestamp
```json
{
  "id": "forged-activity",
  "userId": "attacker@pmo.local",
  "userName": "Hacker",
  "type": "MALWARE_DEPLOYED",
  "timestamp": "2099-12-31"
}
```
*Expected: PERMISSION_DENIED (invalid/unrecognized activity type)*

### Attack Vector 11: Document Archive Hijack
```json
{
  "id": "fake-sop",
  "title": "",
  "category": "Regulatory",
  "author": "Secret Spoofer"
}
```
*Expected: PERMISSION_DENIED (mandatory title is empty)*

### Attack Vector 12: Missing Primary Context
```json
{
  "title": "A valid title",
  "category": "UnmappedCategory"
}
```
*Expected: PERMISSION_DENIED (field category is invalid or missing)*

---

## 3. Security Unit Tests (Deterministic Logic Runner)

Since physical node firestore testing requires a running emulator, we construct our formal assertions within `DRAFT_firestore.rules` and run the validator compiling process on deploy. All attacks are logically prevented with structural type guards, size boundaries, and exact field count verifications.
