# Candidate Notes

## 1. What you built and why

Task A - the Approval Inbox. 

I felt it was best aligned with the role, and it plays to my personal strengths and natural inclination toward customer experience (aka product x engineering corssover). 

## 2. Key implementation notes

### Tech

- **Client-side join of timesheets and contracts**
  - **Decision:** join timesheets and contracts on the frontend 
  - **Why:** no endpoint returns them already joined. backend work was out of scope
  - **Trade-off:** two API calls instead of one, more client-side complexity, and arguably backend remit — this sounds like a job for a nested serializer.

- **Bulk actions without a bulk endpoint**
  - **Decision:** fire individual concurrent requests instead of a bulk endpoint.
  - **Why:** no bulk endpoint exists; 
  - **Trade-off:** more network overhead and no atomicity — partial failures need explicit handling.

- **Optimistic updates, no rollback**
  - **Decision:** update the UI immediately and let a refetch correct any failures, rather than snapshot/rollback.
  - **Why:** reduces friction / keeps bulk actions feeling instant rather than waiting on N requests to resolve.
  - **Trade-off:** a brief flicker on failure, in exchange for much simpler logic.

- **Lightweight test mocking**
  - **Decision:** mock the fetch layer directly instead of introducing MSW.
  - **Why:** MSW's setup seemed ott for this task
  - **Trade-off:** less realistic network testing, but far less setup for the scope of this task.

- **Folder structure**
  - **Decision:** split the page into its own folder (`hooks/` + `components/` not reusable elsewhere).
  - **Why:** keeps growing page logic organized without over-abstracting into shared components.
  - **Trade-off:** more files to navigate than a single file, but each piece stays small, readable, and testable on its own.

### Product

- **Rejection requires a reason**
  - **Decision:** require a reason, chosen from a fixed list.
  - **Why:** smoother user experience - drop down + select 
  - **Trade-off:** a generic "Other" doesn't tell the freelancer much.

- **Select All respects the active filter**
  - **Decision:** scope "Select All" to what's currently visible, with a warning if part of the selection is hidden.
  - **Why:** prevents an admin acting on, or losing track of, entries they can't currently see.
  - **Trade-off:** more state to manage, but avoids acting on entries the admin can't see.

- **Partial failure is visible, not all-or-nothing**
  - **Decision:** let successes go through and flag failures individually, rather than failing the whole batch.
  - **Why:** bulk actions are N independent requests, so partial failure is the expected case
  - **Trade-off:** more UI states to handle, but one bad entry doesn't block the rest.

- **Inbox shows only what's actionable**
  - **Decision:** scope the page to submitted entries only, not a general timesheet browser.
  - **Why:** matches the brief
  - **Trade-off:** a focused worklist, but no way to review past decisions here.

## 3. Your workflow

I used Claude Code as my main AI pairing tool throughout this task. 

#### POC 

Built a quick proof-of-concept to talk through some of the higher-level design choices and navigate Product / Design decisions.

#### Dev work
I worked in a spec -> discuss (I drive)  → implementation plan → execute  → review loop with Claude (CLI)

## 4. Next steps

- **Admin Notifications** — persisted, app-level notifications with automatic retry. Currently failure state is page-local.

- **Freelancer-facing notifications** — notify when their entry is approved or rejected.

- **Nav bar alert icon** — I'd add a small badge in the nav bar for new or failed approvals awaiting action.

- **Backend bulk endpoint + nested serializer** — I'd build a real bulk-update endpoint with a nested contract+timesheet serializer. Or consider moving to per-record mutations so each row gets its own
  optimistic rollback and error state

- **Richer table: sorting, pagination, and history** — I'd extend the table to sort, paginate, and show approved/rejected entries, not just submitted ones.

- **Free-text rejection reason** — I'd let "Other" capture free text

