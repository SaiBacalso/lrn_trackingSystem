# Integrated LRN-Based Student Progression Tracking System

A web-based prototype for tracking junior high school student progression using the Learner Reference Number (LRN). The system is designed to help school staff upload LIS records, manage student information, monitor cohort movement from Grade 7 to Grade 10, and generate basic progression reports.

## Project Purpose

The system focuses on making student progression tracking more organized and easier to review. It uses the LRN as the main identifier for each learner and provides a simple workflow for checking student records, cohort status, and progression rates.

## Main Features

- Admin login page
- Dashboard with student and progression summaries
- LIS upload page with file preview and LRN validation prototype
- Student records page with search, filter, add, view, and edit actions
- Cohort tracking page for Grade 7 to Grade 10 progression
- Reports page with basic progression rates and CSV export
- Temporary browser storage using `localStorage` while the database is not yet connected

## Current Scope

This version is intentionally kept simple and achievable for a final project prototype.

Included modules:

- Login
- Dashboard
- LIS Upload
- Student Records
- Cohort Tracking
- Reports

Not included in the current scope:

- Full user management
- Multiple account roles
- Audit logs
- Notifications
- Predictive analytics
- Complex charts
- Separate computations module

The basic formulas are already included in the Reports page.

## Technology Used

- Python
- Flask
- HTML
- CSS
- Bootstrap
- Bootstrap Icons
- JavaScript
- Browser `localStorage` for temporary prototype data

## Project Structure

```text
FinalProject/
|-- app.py
|-- PROJECT_SCOPE.md
|-- README.md
|-- rsc/
|   `-- schoolLogo.png
`-- templates/
    |-- index.html
    |-- dashboard.html
    |-- lis_upload.html
    |-- records_page.html
    |-- co_tracking.html
    |-- reports.html
    |-- computations.html
    |-- users.html
    |-- css/
    `-- js/
        `-- prototype.js
```

## How To Run

1. Open the project folder in a terminal.

2. Activate the virtual environment.

For bash:

```bash
source .venv/Scripts/activate
```

For PowerShell:

```powershell
.\.venv\Scripts\activate
```

3. Install Flask if it is not installed yet.

```bash
python -m pip install flask
```

4. Run the application.

```bash
python app.py
```

5. Open the system in your browser.

```text
http://127.0.0.1:5000/login
```

## Main Routes

| Page | Route |
| --- | --- |
| Login | `/login` |
| Dashboard | `/dashboard` |
| LIS Upload | `/lis-upload` |
| Student Records | `/students` |
| Cohort Tracking | `/cohort-tracking` |
| Reports | `/reports` |

## Prototype Behavior

Since the database is not yet connected, the system uses browser `localStorage` to make the buttons functional.

Currently functional prototype actions:

- Preview LIS upload rows
- Import valid demo records
- Add a student
- View student details
- Edit student status and section
- Search and filter student records
- Generate cohort tracking view
- Generate report summary
- Export report data as CSV

Data saved in `localStorage` stays only in the current browser. Clearing browser data will reset the prototype records.

## Planned Backend Improvements

Recommended backend development order:

1. Add secure admin login with sessions
2. Create a student database table
3. Implement LIS Excel/CSV upload parsing
4. Validate missing and duplicate LRNs
5. Save imported records to the database
6. Build student search and filtering from the database
7. Store cohort progression records
8. Generate reports from real database data

## Security Scope

For the current project scope, security should stay simple:

- Admin login
- Logout
- Protected pages
- Hashed password storage once database login is added
- File type validation for uploads
- LRN validation before import

Full role-based user management can be added in future development.

## Notes

This project is currently a functional frontend/backend prototype. It is designed to demonstrate the main workflow clearly without making the system overly complicated before the database is added.