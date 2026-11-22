# ShikshaSetu Backend — Spring Boot + H2

This backend is the data/API layer for the ShikshaSetu frontend in `../frontend`.

## Stack
- Java 21
- Spring Boot 3.5.6
- Spring Web / REST
- Spring Data JPA + Hibernate
- H2 file database for local development
- Maven

## Run (PowerShell / VS Code)
Open a terminal in this `backend` folder:

```powershell
mvn clean package
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```

The API listens at `http://localhost:8080`. The dev profile uses `./data/shikshasetu` and keeps records between restarts.

H2 console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/shikshasetu`
- User: `sa`
- Password: blank

## Frontend connection
Run the frontend from the sibling `frontend` folder on `http://localhost:5500` (VS Code Live Server or `python -m http.server 5500`). The frontend uses `http://localhost:8080` by default. You can override it from the browser console:

```js
localStorage.setItem("shikshasetu-api", "http://localhost:8080");
```

CORS is intentionally limited to loopback development origins (`localhost` and `127.0.0.1`). Do not broaden it for public deployment.

## Connected API routes
- `GET /api/health` — connection check.
- `GET /api/students`, `POST /api/students`, `GET /api/students/{id}`, `PUT /api/students/{id}`, `DELETE /api/students/{id}` — student records.
- `POST /api/students/{id}/assess` — save a risk assessment.
- `GET /api/students/{id}/risk-history` — saved assessments and explanations.
- `GET /api/students/{id}/academic-records`, `POST /api/students/{id}/academic-records`, `DELETE /api/students/{id}/academic-records/{recordId}` — dated subject/attendance snapshots.
- `GET /api/students/{id}/early-warnings` — backend trend warnings.
- `GET /api/interventions` — intervention catalogue.
- `GET /api/students/{id}/feedback`, `POST /api/students/{id}/feedback` — mentor notes and scheduled follow-ups.
- `PATCH /api/students/{id}/feedback/{feedbackId}/outcome` — persist the follow-up outcome.
- `GET /api/fairness/audit` and `GET /api/dashboard` — aggregate reporting.
- `POST /api/import/students` — CSV import (`file` multipart field).

## Important behavior
- Dated trend snapshots from the Mentor Support Loop are saved as `AcademicRecord` rows. The backend derives grade-drop, repeated-low-result, attendance-decline, consecutive-absence and manually reported repeated-failure warnings.
- The next risk assessment incorporates available backend trend warnings. Save a trend snapshot, then run a fresh assessment to update the saved score and explanation.
- Mentor notes, weekly targets, scheduled follow-up dates and outcome status/notes are persisted in `mentor_feedback`.
- The dashboard's current risk engine is a transparent demonstration heuristic, not a trained or validated AI/ML model. It is a review prompt, not a diagnosis or permanent student label.
- Wellbeing mood check-ins and the phone-a-friend call remain browser-local / user-initiated in this release; they are not sent to the backend.
- Login/registration is still a frontend demo. The backend does not yet authenticate users or enforce roles. Do not use this demo session to protect real student records.

## Production hardening required
Add server-side identity/authentication, secure password hashing, email verification, authorization for each student record, CSRF/session/token protections, audit logging, encryption, backup/retention policies, privacy/legal review, database migrations and a validated ML pipeline before handling real student records.

## AI Admin Console — Spring Boot additions
The backend now includes a persistent AI Admin data layer:
- `GET /api/ai/status` — reports the actual connection state of the model and chatbot.
- `GET /api/ai-admin/overview` — central counts, averages, latest assessment bands, pending follow-ups and all student rows.
- `GET /api/ai-admin/students` and `GET /api/ai-admin/students/{id}` — central registry and complete student inspection data.
- `POST /api/ai-admin/students/{id}/interpretations` — save contextual manual interpretation.
- `GET /api/ai-admin/interpretations` and per-student interpretation history.
- `PUT` and `DELETE` routes for manual interpretation records.

Manual interpretations are stored in the H2 table `manual_interpretations`. Each note snapshots the latest assessment ID, score, band and timestamp when saved. The note does not overwrite the source student record or assessment. Deleting a student also deletes their dependent manual interpretations.

The AI Admin is a system capability, not a human user. The transparent rule-based baseline remains available; a separately trained Weka Random Forest is used when a valid model artifact is loaded. The student chatbot remains a frontend-only preview and has no chat API in this phase.

See `AI-ADMIN-API.md` and `requests.http` for all new request examples.

## Local run reminder
PowerShell, from this backend folder:
```powershell
mvn clean package
mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
```
The H2 file database is stored in `./data/shikshasetu` during the `dev` profile. H2 console: `http://localhost:8080/h2-console`.


## AI model training milestone

See `ai-training/README.md`. The first trainable Weka Random Forest predicts a defined next-period academic-deterioration outcome from earlier academic/engagement features. It is not trained until approved labelled longitudinal CSV data is supplied. Existing routes and features remain in place.

New routes:
- `GET /api/ai/model/status`
- `POST /api/ai/model/train` (multipart field `file`)
- `POST /api/ai/students/{studentId}/assessment`
- `GET /api/ai/students/{studentId}/history`

New AI assessment history is stored separately in `ai_assessments`; the existing `/api/students/{id}/assess` endpoint is unchanged.


## Dated Support Loop persistence (added)

`POST /api/students/{studentId}/academic-trends` stores a previous/latest subject result pair as two dated `student_academic_records` rows in one transaction. The request requires real `previousRecordDate` and `latestRecordDate` values (previous must be earlier, latest cannot be in the future), marks from 0–100, and optional previous attendance, consecutive absences and repeated failures. These records become available through the existing academic-record list and can feed the Random Forest feature service when its model is trained. Do not fabricate dates or labels.

The frontend now syncs manual interpretations with `/api/ai-admin/students/{id}/interpretations`, follow-up outcomes with `PATCH /api/students/{id}/feedback/{feedbackId}/outcome`, and dated trend pairs with the new route. Voluntary mood check-ins deliberately remain separate and browser-local in this prototype.

**Security / deployment:** these routes remain development endpoints without authentication in this package. Add Spring Security, server-side identity/role enforcement, audit logging, HTTPS, backup/retention controls and institutional privacy review before using real student records. Client-side role labels are not access control.
