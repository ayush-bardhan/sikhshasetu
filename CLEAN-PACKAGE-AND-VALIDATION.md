# ShikshaSetu — Clean package and validation

This package keeps the original frontend, backend, documentation, and local image assets together.

## Local checks performed
- JavaScript syntax: all 5 JavaScript files passed `node --check`.
- HTML local references: both HTML pages checked; no missing local `src` or `href` targets were found.
- Project assets and source files were retained.
- The extracted folder is named `ShikshaSetu`; the full-stack README now uses that folder name.

## Run locally (Windows PowerShell)
1. Open this `ShikshaSetu` folder in VS Code.
2. In Terminal 1:
   ```powershell
   cd backend
   mvn clean test
   mvn spring-boot:run "-Dspring-boot.run.profiles=dev"
   ```
3. In Terminal 2, start VS Code Live Server from this project root (or run `python -m http.server 5500`).
4. Open `http://127.0.0.1:5500`.

## Important verification boundary
A full Maven/Spring Boot compile and runtime integration test has not been run as part of this package cleanup. Run the Maven commands above on a machine with Java 21 and Maven installed. This package cleanup does not certify authentication, production security, or real-student-data readiness.
