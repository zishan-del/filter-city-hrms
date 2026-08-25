# Task photo workflow

- Admin creates, edits, or deletes tasks.
- Employee sees assigned tasks and can move status Pending -> In Progress -> Completed.
- Employee can upload one compressed photo per task, replace it, or delete it by submitting an empty photo value.
- Admin can view the employee photo from the task record.
- Deleting a task removes its stored photo data with the task row.
- Photo payload is limited to 700000 characters server-side to protect database storage.
