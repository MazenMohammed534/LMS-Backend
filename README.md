# LMS Backend

A professional Learning Management System (LMS) backend built with Node.js, Express, and MongoDB. This API supports role-based access for Admin, Teacher, and Student users, course management, course material uploads, quizzes, assignments, and user authentication.

## Key Features

- Role-based authentication and authorization
- JWT-secured API with protected routes
- Admin dashboard: user management, course archive management, statistics
- Teacher operations: create/edit/delete courses, upload/delete materials, manage students
- Student operations: join courses, access course materials, view enrolled courses, task and quiz stats
- Quiz management: create quizzes, take quizzes, submit quiz responses, view quiz submissions
- Assignment workflow: create assignments, file/text submissions, grade submissions
- File uploads for avatars, course materials, and assignment submissions

## Technology Stack

- Node.js
- Express
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Multer for file uploads
- bcryptjs for password hashing
- dotenv for environment configuration
- cors for cross-origin support

## Repo Structure

- `server.js` - application entrypoint
- `config/db.js` - MongoDB connection setup
- `config/seed.js` - default admin account seeding
- `controllers/` - request handlers for auth, admin, teacher, student, quiz, assignment
- `routes/` - Express route definitions
- `middleware/` - JWT auth, role authorization, file upload handling
- `models/` - Mongoose schemas for users, courses, quizzes, assignments, submissions, materials
- `uploads/` - local storage for uploaded files

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

> Do not commit secrets to source control.

## Installation

```bash
npm install
```

## Running Locally

```bash
npm run dev
```

The API will run by default on `http://localhost:5000`.

## Default Admin Account

When the server starts, the project seeds a default admin account if no admin user exists:

- Email: `admin@campus.edu`
- Password: `adminpassword123`

Use this account to create additional users and manage the system.

## API Endpoints Overview

### Authentication

- `POST /api/auth/signup` - register a new student with optional avatar upload
- `POST /api/auth/login` - login and receive JWT token
- `GET /api/auth/profile` - get current user profile
- `PUT /api/auth/profile` - update profile and avatar
- `PUT /api/auth/change-password` - change current password

### Admin

- `GET /api/admin/stats` - retrieve platform statistics
- `GET /api/admin/users` - list users, optional role filter
- `POST /api/admin/users` - create a new user
- `PUT /api/admin/users/:id` - update user details
- `DELETE /api/admin/users/:id` - delete a user
- `GET /api/admin/courses` - list all courses with optional archive filter
- `PUT /api/admin/courses/archive-all` - archive all active courses
- `PUT /api/admin/courses/:id/archive` - archive a course
- `PUT /api/admin/courses/:id/unarchive` - unarchive a course

### Teacher

- `GET /api/teacher/courses` - list courses created by the teacher
- `POST /api/teacher/courses` - create a course
- `PUT /api/teacher/courses/:id` - edit a course
- `DELETE /api/teacher/courses/:id` - delete a course and its materials
- `GET /api/teacher/courses/:id/students` - list enrolled students
- `POST /api/teacher/materials` - upload course material
- `DELETE /api/teacher/materials/:id` - remove course material

### Student

- `GET /api/student/courses` - list enrolled courses
- `POST /api/student/courses/join` - join a course using its code
- `GET /api/student/courses/:courseId/materials` - retrieve course materials
- `GET /api/student/stats` - student dashboard statistics

### Quizzes

- `GET /api/quizzes/course/:courseId` - list quizzes for a course
- `POST /api/quizzes` - create a quiz (teacher only)
- `GET /api/quizzes/:id` - get quiz details (teacher only)
- `PUT /api/quizzes/:id` - update quiz (teacher only)
- `DELETE /api/quizzes/:id` - delete quiz (teacher only)
- `GET /api/quizzes/:id/submissions` - view quiz submissions (teacher only)
- `GET /api/quizzes/:id/take` - get quiz for taking (student only)
- `POST /api/quizzes/:id/submit` - submit quiz answers (student only)

### Assignments

- `POST /api/assignments` - create assignment (teacher only)
- `GET /api/assignments/course/:courseId` - list assignments for a course
- `PUT /api/assignments/:id` - update assignment (teacher only)
- `DELETE /api/assignments/:id` - delete assignment and submissions (teacher only)
- `POST /api/assignments/:id/submit` - submit assignment with optional file upload (student only)
- `GET /api/assignments/:id/submission` - view own submission (student only)
- `GET /api/assignments/:id/submissions` - review all submissions (teacher only)
- `PUT /api/assignments/submissions/:submissionId/grade` - grade a submission (teacher only)

## Notes

- Uploaded files are served from `/uploads`.
- Use the `Authorization: Bearer <token>` header for protected routes.
- File upload endpoints accept `multipart/form-data`.

## License

This project is provided as-is for LMS backend development.
