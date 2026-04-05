# Technology Stack

While we prefer React and Node.js, use whatever stack you're comfortable with.
You can assume the reviewer has Docker installed or you can share a link to a replit (or
similar).
Ensure your solution is easily runnable with at most two commands from a Makefile for a
local app or a README on how to run a hosted version.

# Project: Novellia Pets
Novellia Pets is a new service spun off from Novellia where we gather and display medical
records for your furry friend. You will be building the MVP of Novellia Pets which will consist of:

# Core Features:
1. Pet Management - Create, view, edit, and delete pets
2. Medical Records - Add, view, edit, and delete medical records for pets
3. Dashboard - Overview of all pets with key statistics
4. Search & Filter - Find pets by name, animal type, or filter records by type
5. One additional feature you think would be useful / cool


# Data Model
Every pet has:
- A name
- The type of animal
- Name of owner
- Date of Birth

Every pet can have two kinds of medical records:
- Vaccines which have the name of the vaccine and a date it was administered
- Allergies which have the name of the allergy, the pet's reactions (e.g., hives, rash) and
severity (mild or severe)


# User Stories
- As a user, I can add a new pet with all required information
- As a user, I can view a list of all my pets
- As a user, I can click on a pet to see its detailed profile and medical history
- As a user, I can edit or delete a pet
- As a user, I can add a vaccination or allergy record to a pet
- As a user, I can edit or delete a medical record
- As a user, I can search for pets by name
- A a user, I can filter the pet list by animal type
- As an admin, I can see dashboard statistics (total pets, pets by type, upcoming vaccines,
etc.)

# Technical Requirements:
Frontend:
- Build a responsive, user-friendly interface
- Form validation for all inputs
- Confirmation dialogs for delete actions
- Clear error messages and loading states
- At least 3-4 distinct pages/views (e.g., Dashboard, Pet List, Pet Detail, Add/Edit forms)

Backend:
- Input validation and error handling
- Proper status codes and error responses
- Data persistence (database of your choice)

Additional Notes

- You do not need to add login/authentication/sessions, but should discuss how you would approach it
- You can use any kind of persistence you want (Redis/Memcached, in-memory, SQLite,
SQL database like Postgres or MySQL, print to a fax machine and then OCR it) as long
as data persists while the app is running
- When on-site, we might be adding a third type of record (e.g., could be a lab result, vital,
visit or something else) so be sure to take that into account when designing and building
this (admin feature)
- Focus on both clean frontend code and well-structured backend architecture
