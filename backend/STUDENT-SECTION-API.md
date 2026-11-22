# ShikshaSetu Backend — Student Section

This Spring Boot backend is wired to the sibling `frontend/` project in the ShikshaSetu integrated package.

## What the Student backend provides

### Student profile management
- Create, list, view, update and delete student profiles.
- Validates Student ID, name, email, attendance, internal marks, assignment completion, previous failures and absence count.
- Prevents duplicate Student IDs.
- Optional `auditGroup` is stored only for aggregate fairness review; it is excluded from individual scoring.

### Risk estimates and explanations
- `POST /api/students/{id}/assess` creates and saves a time-stamped assessment.
- Returns a `LOW`, `MEDIUM` or `HIGH` support-priority band, score, explanation and feature contributions (`parts`) compatible with the current frontend.
- `GET /api/students/{id}/risk-history` returns saved estimates with their historical explanations.

### Academic trend records / early warnings
The student profile form in the current frontend stores the latest summary fields. For trend monitoring across subjects and dates, this backend also exposes academic-record endpoints:
- Subject assessment marks and maximum marks.
- Attendance percentages over time.
- Absence counts and consecutive absences.
- Early-warning signals for sudden grade drops, repeated low results in a subject, attendance decline, consecutive absences and manually recorded repeated failures.

The integrated Mentor Support Loop creates dated records from the trend snapshot form. These are still source records, not a trained ML model; staff should verify the underlying data.

### CSV import
- `POST /api/import/students` accepts a multipart field named `file`.
- Required headers: `student_code,full_name,attendance,internal_marks,assignments_completed,previous_failures,absences`.
- Optional headers: `email,audit_group`.
- Duplicate Student IDs are skipped and reported.

## Requirements
- JDK 21+
- Maven 3.9+
- VS Code or IntelliJ IDEA

## Run with H2 (recommended for the current setup)

Open the extracted `shikshasetu-backend-student-section` folder in VS Code.

PowerShell terminal:
```powershell
mvn clean package
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The service starts at:
`http://localhost:8080`

H2 console:
`http://localhost:8080/h2-console`

H2 connection:
- JDBC URL: `jdbc:h2:file:./data/shikshasetu`
- Username: `sa`
- Password: blank

The dev profile uses an H2 file database in `./data`, so records persist between application restarts. This is suitable for local development / a hackathon demo, not a production database.

## Frontend connection

The frontend's API base URL is `http://localhost:8080`. Start the backend first, then launch the connected frontend with Live Server. The backend CORS configuration allows local loopback frontend origins on localhost / 127.0.0.1 ports.

The connected frontend calls:
- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/{id}`
- `POST /api/students/{id}/assess`
- `GET /api/students/{id}/risk-history`
- `POST /api/import/students` (CSV upload)

The Support Loop also persists dated academic records, early-warning signals, mentor feedback and follow-up outcomes using the endpoints listed below.

## Student API reference

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/students` | List all students |
| POST | `/api/students` | Create a student |
| GET | `/api/students/{id}` | View one student |
| PUT | `/api/students/{id}` | Update a student |
| DELETE | `/api/students/{id}` | Delete student and dependent history/notes |
| POST | `/api/students/{id}/assess` | Save a risk assessment |
| GET | `/api/students/{id}/risk-history` | Historical assessments |
| GET | `/api/students/{id}/early-warnings` | Current rule-based trend warnings |
| GET | `/api/students/{id}/academic-records` | List dated subject / attendance records |
| POST | `/api/students/{id}/academic-records` | Add a dated academic record |
| DELETE | `/api/students/{id}/academic-records/{recordId}` | Delete one academic record |
| POST | `/api/students/{id}/feedback` | Save mentor notes and follow-up |
| GET | `/api/students/{id}/feedback` | List mentor notes and follow-ups |
| PATCH | `/api/students/{id}/feedback/{feedbackId}/outcome` | Update a follow-up outcome |
| GET | `/api/interventions` | Get the intervention catalogue |
| GET | `/api/fairness/audit` | Aggregate fairness audit |
| GET | `/api/dashboard` | Dashboard summary statistics |
| GET | `/api/health` | Backend health / connection check |
| POST | `/api/import/students` | Import normalized student CSV |

### Create student — PowerShell

```powershell
$student = @{
  studentCode = "STU-101"
  fullName = "Aarav Sharma"
  email = "aarav@example.edu"
  attendance = 72
  internalMarks = 54
  assignmentsCompleted = 68
  previousFailures = 0
  absences = 4
  auditGroup = "Group A"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/students" `
  -Method POST `
  -ContentType "application/json" `
  -Body $student
```

### Run assessment — PowerShell

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/students/1/assess" `
  -Method POST
```

Response fields include:
```json
{
  "id": 1,
  "studentId": 1,
  "riskScore": 42,
  "riskBand": "MEDIUM",
  "explanation": "Indicator contributions (points): ...",
  "assessedAt": "2026-11-05T10:30:00",
  "parts": [
    ["Low attendance", 15],
    ["Low internal marks", 12]
  ]
}
```

### Add a subject assessment record

```powershell
$record = @{
  subject = "Mathematics"
  assessmentName = "Unit Test 2"
  recordDate = "2026-11-03"
  marksObtained = 28
  maxMarks = 50
  notes = "Unit test result"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/students/1/academic-records" `
  -Method POST `
  -ContentType "application/json" `
  -Body $record
```

For attendance history, submit an attendance record with `subject`, `recordDate`, `attendancePercent`, and optional `absenceCount` / `consecutiveAbsences`. The integrated frontend creates previous/latest dated records from the Trend Snapshot form. `repeatedFailures` can also be stored on a dated record and produces an early-warning signal. You can include marks and attendance values in the same record if they share the same reporting date.

### Get early warnings

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/students/1/early-warnings" `
  -Method GET
```

## Risk scoring rules and limitations

This release contains a transparent **rule-based demonstration heuristic**, not a trained or validated AI model. It does not use age, email, name, audit group, or other demographic attributes to calculate scores.

Current feature weights:
- Attendance below 60%: +25; 60–74.99%: +15.
- Internal marks below 40%: +20; 40–54.99%: +12.
- Assignments completed below 50%: +15; 50–74.99%: +8.
- Previous course failures: +5 each, capped at +15.
- Absence count: +2 each, capped at +10.
- Recent mark drop of at least 10 percentage points in a subject: +6 per subject, capped at +12.
- Two consecutive recorded results below 40% in a subject: +6 per subject, capped at +12.
- Attendance decline of at least 10 percentage points: +8.
- At least 3 consecutive absences in a record: +8.
- Final score is capped at 100; LOW = 0–29, MEDIUM = 30–59, HIGH = 60–100.

These are prototype thresholds. Risk bands are temporary prompts for supportive human review, not diagnoses, causes, or permanent student labels. A warning may signal a need to check context; it does not establish why a student's results or attendance changed.

## Important UCI dataset note

The UCI Student Performance dataset does not provide every field above as a direct value. Attendance percentage and assignment completion may need to be derived from institution-approved source records. Do not invent missing fields or treat the final grade as a validated support-risk label.

## Before real deployment

Add authenticated staff access, role-based authorization, audit logging, encryption, backups, consent and retention rules, database migrations, and security review. The current local backend does not yet enforce user authentication or authorization. Do not expose real student records publicly.


### Save a follow-up outcome

```powershell
$outcome = @{
  status = "Completed · improvement noted"
  outcomeNote = "Student completed the weekly target and requested another check-in."
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "http://localhost:8080/api/students/1/feedback/1/outcome" `
  -Method PATCH `
  -ContentType "application/json" `
  -Body $outcome
```

The valid statuses are `Completed · improvement noted`, `Completed · no clear change yet`, `Further support needed`, and `Student not reached`.


## AI Admin and manual interpretation API

The AI Admin is a platform system capability, not a human administrator login. The Spring Boot backend exposes a central data view and stores contextual interpretations separately from risk scores.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/ai/status` | Actual connection status of the model and student chatbot |
| GET | `/api/ai-admin/overview` | Counts, averages, open follow-ups and all current student rows |
| GET | `/api/ai-admin/students` | Student values, latest assessment, trend warnings and related-record counts |
| GET | `/api/ai-admin/students/{id}` | Full student detail, risk history, academic records, warnings, mentor notes and manual interpretations |
| GET | `/api/ai-admin/interpretations` | All manual interpretation entries |
| GET | `/api/ai-admin/students/{id}/interpretations` | Manual interpretation history for one student |
| POST | `/api/ai-admin/students/{id}/interpretations` | Create a manual interpretation and snapshot the latest assessment |
| PUT | `/api/ai-admin/students/{id}/interpretations/{interpretationId}` | Update manual review text/status |
| DELETE | `/api/ai-admin/students/{id}/interpretations/{interpretationId}` | Delete a manual interpretation |

Allowed review statuses: `Needs mentor context`, `Reviewed with student`, `Follow-up planned`, `Escalate to trained mentor`.

Manual interpretation body:
```json
{
  "reviewStatus": "Reviewed with student",
  "interpretation": "The student explained a timetable change that affected attendance. The indicators need to be reviewed with this context.",
  "evidence": "Student conversation and dated attendance records.",
  "nextAction": "Mentor to agree a realistic attendance plan and review next week."
}
```

The saved interpretation snapshots the latest risk assessment ID, score, band and timestamp. It does not change the student profile or existing score. The records are persisted in the H2 `manual_interpretations` table.

The student chatbot remains frontend-only in this phase. No Spring Boot chat endpoint or trained language model has been added yet. See `AI-ADMIN-API.md` for full request examples and security notes.
