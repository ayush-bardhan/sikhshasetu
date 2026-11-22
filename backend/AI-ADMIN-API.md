# ShikshaSetu AI Admin API — Spring Boot

The AI Admin Console is a **platform capability**, not a human administrator account. These endpoints expose the current student data and assessment state for the console and persist contextual manual interpretations.

> Model status is deployment-dependent: the transparent baseline remains available, and the separate Weka Random Forest is used only when a valid trained artifact is loaded. These endpoints do not allow the AI model to autonomously change student profiles, delete records, or make consequential decisions.

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/ai/status` | Reports connected/not-connected AI capabilities |
| GET | `/api/ai-admin/overview` | Counts, averages, model status and student registry rows |
| GET | `/api/ai-admin/students` | All student records with latest assessment, academic-record counts, mentor-feedback counts, manual-review counts and early warnings |
| GET | `/api/ai-admin/students/{studentId}` | Full record, assessment history, dated academic records, early warnings, mentor feedback and manual interpretations |
| GET | `/api/ai-admin/interpretations` | All saved manual interpretations |
| GET | `/api/ai-admin/students/{studentId}/interpretations` | Interpretations for one student |
| POST | `/api/ai-admin/students/{studentId}/interpretations` | Save a contextual interpretation and snapshot the latest risk assessment |
| PUT | `/api/ai-admin/students/{studentId}/interpretations/{interpretationId}` | Update the interpretation without changing student values or the assessment snapshot |
| DELETE | `/api/ai-admin/students/{studentId}/interpretations/{interpretationId}` | Delete a manual interpretation |

## Create manual interpretation

`POST /api/ai-admin/students/1/interpretations`

```json
{
  "reviewStatus": "Reviewed with student",
  "interpretation": "The student explained that a timetable change affected attendance. The recorded indicators should be considered with this context; they do not establish the cause.",
  "evidence": "Discussed the timetable and checked the latest dated attendance records.",
  "nextAction": "Mentor to agree a manageable attendance plan and review it next week."
}
```

Allowed `reviewStatus` values:
- `Needs mentor context`
- `Reviewed with student`
- `Follow-up planned`
- `Escalate to trained mentor`

The saved row includes a copy of the student's name and Student ID plus the latest assessment ID, score, band and assessment timestamp at the time of review. Updating the manual note does not update that assessment snapshot or modify the original student record.

## Overview response shape

The overview response includes:
- `totalStudents`, `assessedStudents`, `unassessedStudents`
- `lowSupport`, `mediumSupport`, `highSupport`
- `openFollowUps`, `manualInterpretations`
- `averageAttendance`, `averageInternalMarks`, `averageAssignmentCompletion`
- `modelStatus`, `notice`
- `students`: student source fields, latest assessment, academic-record count, mentor-feedback count, manual-interpretation count and early warnings

## Chatbot boundary

The Student AI Companion remains a frontend preview in this phase, as requested. There is no `/api/ai/chat` endpoint yet and no LLM is called. When the model is developed, add a Spring Boot service/controller that calls the model provider server-side; do not put provider keys in browser JavaScript.

## Security boundary

This project currently has no authentication or role-based authorization. The AI Admin endpoints are available on the local development server and are **not production-secure**. Before using real student data, add Spring Security, authenticated staff/mentor roles, server-side authorization, audit logging and institution-approved privacy controls. UI visibility is not access control.
