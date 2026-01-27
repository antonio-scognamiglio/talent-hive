# Seed Data

This directory contains test files used by the database seed script.

## Files

- **`dummy-cv.pdf`**: Test CV file uploaded to MinIO during seeding
  - Used for all application records in the seed
  - Should be a valid PDF file (any dummy CV will work)
  - Path on MinIO: `cvs/seed-test/dummy-cv.pdf`

## Usage

The seed script (`seed.ts`) reads files from this directory and uploads them to MinIO before creating database records.

**Important**: Make sure `dummy-cv.pdf` exists before running the seed, otherwise it will fail.
