# FitRack - Sports Complex Management System
FitRack is a web-based platform that simplifies and digitizes the management of a sports complex. It includes user registration, court and gym bookings, trainer schedules, membership plans, and admin functionalities to manage users and data.

---

## Features
- 🧾 User Registration & Login with role selection
- 🏋️ Gym Plan Booking (Weight Loss, Muscle Gain, Cardio, CrossFit)
- 🏀 Court Booking (Tennis, Badminton, Squash, etc.)
- 👨‍🏫 Trainer Schedule Display
- 👤 User Profile Dashboard
- 🛠️ Admin Panel for:
  - Viewing users, employees, bookings, equipment
  - Inserting new equipment
  - Deleting records via API

---

## Technologies Used
- **Frontend**: HTML, Tailwind CSS, Bootstrap 5, JavaScript
- **Backend**: Node.js with Express.js
- **Database**: MySQL

---

## Backend API Endpoints
- POST /insert/:entity – Insert new record into specified table
- GET /get/:entity – Retrieve records (users, trainers, etc.)
- DELETE /delete/:entity/:id – Delete a record by ID
- GET /api/profile/:phone – Fetch profile by phone number

---

## Database Overview
- All tables are normalized up to 3NF for efficiency.
- Users: Stores user personal and membership info
- Memberships: Duration, fees, gym access
- Bookings: Court & gym booking records
- Trainers: Assigned to specific workout plans
- Workout Plans: Linked to trainers and users
- Employees & Staff: Employee roles and schedules
- Facilities & Equipment: Gym and court infrastructure

---

## Setup Instructions
- Unzip the provided folder.
- Run MySQL and import fitrack_db.sql.
- Open terminal and in the backend folder, run the following command:
  node server.js
- Open index.html in a browser to begin using the app.

---

## Authors
- Aayush Gupta (2310110645)
- Sukhraj Singh (2310110310)
- Anuran Basu (2310110053)