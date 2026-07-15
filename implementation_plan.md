# Database-Backed Booking & Queue Persistence

Hook up the front-end bookings and virtual queue functionality to the Prisma database APIs, replacing the current in-memory-only state with fully persistent database storage.

## User Review Required

> [!NOTE]
> All changes will maintain full backward compatibility with the existing in-memory fallback pattern so that if the database becomes unreachable, the application continues to function gracefully in mock mode.

> [!IMPORTANT]
> The database migration schema has already been successfully applied and seeded. We will implement GET, POST, and PATCH methods on the corresponding Next.js API endpoints.

## Proposed Changes

We will implement the following changes to connect the dashboard interfaces to the Neon PostgreSQL database:

---

### Backend API Endpoints

#### [MODIFY] [doctors/route.ts](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/app/api/doctors/route.ts)
- Add a `GET` method that retrieves all doctors and their profiles from the database, transforming the fields (like slots) into arrays.
- Fall back to the mock doctors list if the database query fails.

#### [MODIFY] [appointments/route.ts](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/app/api/appointments/route.ts)
- Update `GET` method to fetch all appointments from the database, including the patient and doctor details.
- Update `POST` method to save booked appointments to the database.
- Add a `PATCH` method to update appointment status, diagnosis, and prescription.
- Implement robust database-connection error catching to fall back to in-memory/mock storage.

#### [MODIFY] [queue/route.ts](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/app/api/queue/route.ts)
- Update `GET` method to fetch live queue entries from the database.
- Update `POST` method to check a patient into the virtual queue.
- Add a `PATCH` method to update queue entry status (WAITING, ACTIVE, COMPLETED).
- Fall back to the in-memory array on database failure.

---

### Frontend Store & Dashboard Integration

#### [MODIFY] [useQueueStore.ts](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/store/useQueueStore.ts)
- Define new action methods to fetch doctors, appointments, and queue entries from the APIs:
  - `fetchDoctors()`
  - `fetchAppointments()`
  - `fetchQueue()`
  - `fetchInitialData()` (runs all three concurrently)
- Make existing booking and queue functions (`bookAppointment`, `checkIntoQueue`, `advanceQueue`, `completeAppointment`) async and update them to send POST/PATCH requests to the backend APIs.
- Enhance slot parsing so that selecting times like `"10:30 AM"` or `"03:30 PM"` correctly parses and sets the hour and minute in the ISO datetime string.

#### [MODIFY] [dashboardshell.tsx](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/app/components/dashboard/dashboardshell.tsx)
- Call `fetchInitialData()` on component mount so that all dashboards (patient, doctor, admin) load the latest state from the database.

#### [MODIFY] [patient/page.tsx](file:///c:/Users/Vitumbiko/Chalo%20Care%20Clinic/chalo-care-clinic/app/%28dashboard%29/patient/page.tsx)
- Display a "Your Booked Appointments" list under the booking form on the "Appointments" tab so that patients immediately see their confirmation list without having to click back to the "Overview" tab.

## Verification Plan

### Automated Tests
- Build and run the project locally:
  ```bash
  npm run build
  ```
- Run standard linting checks:
  ```bash
  npm run lint
  ```

### Manual Verification
- Access the **Patient Console**, book an appointment, and verify that:
  - It saves to the Neon database.
  - It shows up in the "Recent Consultations" and "Your Booked Appointments" list.
- Switch to the **Doctor Console** and verify that:
  - The doctor sees the patient in the queue and schedule.
  - Admitting the patient and completing the consultation (with diagnosis/prescription) saves directly to the database.
- Refresh the page and confirm that all booking and queue status changes persist.
