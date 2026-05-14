# Integrated LRN-Based Student Progression Tracking System Scope

## Main Goal

The system helps school staff track junior high school student progression using the Learner Reference Number (LRN). It focuses on importing LIS records, managing student records, tracking cohorts, computing basic progression rates, and generating simple reports.

## Included Modules

1. Login
   - Basic admin access screen.

2. Dashboard
   - Shows summary counts and progression rates.
   - Provides quick links to upload, records, and reports.

3. LIS Upload
   - Upload or preview LIS Excel/CSV records.
   - Validate missing or duplicate LRNs before importing.

4. Student Records
   - Search, filter, view, and update student information.

5. Cohort Tracking
   - Track students from Grade 7 to Grade 10 by school year.
   - Show final student status such as completed, transferred out, repeater, or dropout.

6. Reports
   - Generate a basic cohort progression summary.
   - Include cohort survival, completion, retention, and repetition rates.
   - Support print/export as simple output actions.

## Excluded From Current Scope

- Advanced user management
- Multiple user roles and permissions
- Audit logs
- Notifications
- Predictive analytics
- Complex charts
- Separate computation module

These features can be added in the future, but they are not required for the core final project goal.

## Backend Priority

Build the backend in this order:

1. Login route
2. Student database table
3. LIS file upload and parsing
4. LRN validation
5. Student search and filtering
6. Cohort tracking records
7. Basic report calculations
8. Print/export report output

This keeps the project straightforward and easier to finish.
