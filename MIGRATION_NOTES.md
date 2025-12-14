# Database Migration Notes

## Schema Changes

The following changes have been made to the Prisma schema:

### User Model
- Added `role` field: `String @default("user")` with possible values: "admin", "user", "doctor", "nurse"
- Added index on `role` field
- Added reverse relations for entry tracking:
  - `demographicEntries Entry[] @relation("DemographicEntries")`
  - `healthEntries Entry[] @relation("HealthEntries")`
  - `medicalEntries Entry[] @relation("MedicalEntries")`

### Entry Model
- Added `demographicCreatedById String?` and `demographicCreatedBy User? @relation("DemographicEntries", ...)`
- Added `healthCreatedById String?` and `healthCreatedBy User? @relation("HealthEntries", ...)`
- Added `medicalCreatedById String?` and `medicalCreatedBy User? @relation("MedicalEntries", ...)`
- Kept existing `createdById` and `createdBy` for backward compatibility (represents initial entry creator)

## Migration Steps

1. **Generate and run the migration:**
   ```bash
   npx prisma migrate dev --name add_roles_and_tracking
   ```

2. **For existing data, you may want to run a migration script to:**
   - Set default role for existing users (if not already set by default)
   - Set `demographicCreatedById = createdById` for existing entries
   - Optionally set `healthCreatedById` and `medicalCreatedById` if those fields were already populated

3. **Example migration script (run after migration):**
   ```typescript
   // In a script file or Prisma Studio
   // Update existing entries to set demographicCreatedById
   await prisma.entry.updateMany({
     where: { demographicCreatedById: null },
     data: {
       demographicCreatedById: prisma.entry.createdById // This won't work directly, need to do per entry
     }
   });
   ```

   Or use a more direct approach:
   ```sql
   UPDATE "Entry" 
   SET "demographicCreatedById" = "createdById" 
   WHERE "demographicCreatedById" IS NULL;
   ```

## Role-Based Access

- **Admin**: Can edit all fields and manage users
- **User**: Can only edit demographic information (firstName, middleName, surname, gender, maritalStatus, religion, dateOfBirth, phoneNumber, occupation)
- **Nurse**: Can only edit health information (bp, temp, weight)
- **Doctor**: Can only edit medical information (diagnosis, treatment)

## Notes

- The `createdById` field still represents the initial creator of the entry
- The `*CreatedById` fields track who last entered/modified each section
- All fields are shown in the form but disabled based on user role
- The form allows loading existing entries for editing by different roles

