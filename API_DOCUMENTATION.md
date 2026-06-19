# LMS API Documentation

This document provides details for integrating the backend API with the frontend application.

- **Base URL:** `http://localhost:5000/api`
- **Authentication:** JWT Token passed in headers: `Authorization: Bearer <your_jwt_token>`
- **Content Types:** 
  - Standard JSON: `application/json`
  - File uploads: `multipart/form-data`

---

## Table of Contents
1. [Authentication (`/api/auth`)](#1-authentication-apiauth)
2. [Admin Dashboard (`/api/admin`)](#2-admin-dashboard-apiadmin)
3. [Teacher Actions (`/api/teacher`)](#3-teacher-actions-apiteacher)
4. [Student Actions (`/api/student`)](#4-student-actions-apistudent)
5. [Quiz Operations (`/api/quizzes`)](#5-quiz-operations-apiquizzes)
6. [Assignment Operations (`/api/assignments`)](#6-assignment-operations-apiassignments)

---

## 1. Authentication (`/api/auth`)

These routes handle signups, logins, profile fetching, profile updates, and password changes.

### `POST /api/auth/signup`
Registers a new user (default role is `student`).
- **Access:** Public
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `username` (string, required)
  - `email` (string, required)
  - `password` (string, required, min 8 chars)
  - `avatar` (file, optional)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "_id": "60d0fe4f53112b32f8312011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "avatar": "uploads/avatar-1624301135.png",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### `POST /api/auth/login`
Authenticates a user and returns a JWT token.
- **Access:** Public
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "_id": "60d0fe4f53112b32f8312011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "avatar": "uploads/avatar-1624301135.png",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### `GET /api/auth/profile`
Gets the logged-in user's profile.
- **Access:** Private (Requires Header: `Authorization: Bearer <token>`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "_id": "60d0fe4f53112b32f8312011",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "student",
    "avatar": "uploads/avatar-1624301135.png"
  }
  ```

### `PUT /api/auth/profile`
Updates the profile of the logged-in user.
- **Access:** Private
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `name` (string, optional)
  - `avatar` (file, optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "_id": "60d0fe4f53112b32f8312011",
    "name": "Jane Updated Name",
    "email": "jane@example.com",
    "role": "student",
    "avatar": "uploads/avatar-new.png"
  }
  ```

### `PUT /api/auth/change-password`
Changes the password of the logged-in user.
- **Access:** Private
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "currentPassword": "securepassword123",
    "newPassword": "newsupersecure123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

## 2. Admin Dashboard (`/api/admin`)

All administrative routes require the user to have the `admin` role.

### `GET /api/admin/stats`
Gets overall portal stats.
- **Access:** Admin only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "stats": {
      "totalStudents": 150,
      "totalTeachers": 12,
      "totalCourses": 8
    }
  }
  ```

### `GET /api/admin/users`
Retrieves all users, optionally filtered by role.
- **Access:** Admin only
- **Query Parameters:**
  - `role` (string, optional. Values: `admin`, `teacher`, `student`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "users": [
      {
        "_id": "60d0fe4f53112b32f8312011",
        "name": "John Teacher",
        "email": "teacher@example.com",
        "role": "teacher",
        "avatar": "",
        "createdAt": "2026-06-14T12:00:00.000Z",
        "updatedAt": "2026-06-14T12:00:00.000Z"
      }
    ]
  }
  ```

### `POST /api/admin/users`
Adds a new user to the system.
- **Access:** Admin only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "name": "Alex Admin",
    "email": "alex@example.com",
    "password": "securepassword123",
    "role": "teacher" 
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Teacher added successfully",
    "user": {
      "_id": "60d0fe4f53112b32f8312011",
      "name": "Alex Admin",
      "email": "alex@example.com",
      "role": "teacher"
    }
  }
  ```

### `PUT /api/admin/users/:id`
Updates details of an existing user.
- **Access:** Admin only
- **Request Body:**
  ```json
  {
    "name": "Updated Name",
    "email": "updated@example.com",
    "password": "newpassword123" 
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "user": {
      "_id": "60d0fe4f53112b32f8312011",
      "name": "Updated Name",
      "email": "updated@example.com",
      "role": "teacher"
    }
  }
  ```

### `DELETE /api/admin/users/:id`
Deletes a user.
- **Access:** Admin only (Cannot delete self)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "User deleted successfully"
  }
  ```

### `GET /api/admin/courses`
Retrieves all courses across the LMS.
- **Access:** Admin only
- **Query Parameters:**
  - `archived` (boolean string, optional. e.g. `true` or `false`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "courses": [
      {
        "_id": "60d0fe4f53112b32f8312011",
        "name": "Advanced Mathematics",
        "code": "MATH301",
        "department": "Mathematics",
        "year": 3,
        "createdBy": {
          "_id": "60d0fe4f53112b32f8312022",
          "name": "John Teacher",
          "email": "teacher@example.com"
        },
        "isArchived": false,
        "cover": "uploads/default-course-cover.jpg",
        "students": [],
        "createdAt": "2026-06-14T12:00:00.000Z"
      }
    ]
  }
  ```

### `PUT /api/admin/courses/archive-all`
Archives all active courses in the database.
- **Access:** Admin only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "5 course(s) archived successfully",
    "archivedCount": 5
  }
  ```

### `PUT /api/admin/courses/:id/archive`
Archives a single course.
- **Access:** Admin only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course archived successfully",
    "course": { ... }
  }
  ```

### `PUT /api/admin/courses/:id/unarchive`
Restores a single archived course.
- **Access:** Admin only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course restored successfully",
    "course": { ... }
  }
  ```

---

## 3. Teacher Actions (`/api/teacher`)

All routes in this section require the user to have the `teacher` role.

### `GET /api/teacher/courses`
Gets all courses created by the logged-in teacher.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "courses": [
      {
        "_id": "60d0fe4f53112b32f8312011",
        "name": "Database Systems",
        "code": "CS302",
        "department": "Computer Science",
        "year": 3,
        "createdBy": "60d0fe4f53112b32f8312022",
        "isArchived": false,
        "cover": "uploads/default-course-cover.png",
        "students": []
      }
    ]
  }
  ```

### `POST /api/teacher/courses`
Creates a new course.
- **Access:** Teacher only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "coursename": "Computer Networks",
    "coursecode": "CS401",
    "year": 4,
    "department": "Computer Science",
    "cover": "uploads/custom-cover.png"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "course": {
      "_id": "60d0fe4f53112b32f8312033",
      "name": "Computer Networks",
      "code": "CS401",
      "year": 4,
      "department": "Computer Science",
      "createdBy": "60d0fe4f53112b32f8312022",
      "isArchived": false,
      "cover": "uploads/custom-cover.png",
      "students": []
    }
  }
  ```

### `PUT /api/teacher/courses/:id`
Edits a course's details. Only the teacher who created the course can edit it.
- **Access:** Teacher only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "coursename": "Updated Networks Name",
    "year": 4,
    "department": "Computer Engineering",
    "isArchived": false,
    "cover": "uploads/new-cover.png"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "course": { ... }
  }
  ```

### `DELETE /api/teacher/courses/:id`
Deletes a course and all associated course materials from the system.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Course and associated materials deleted successfully"
  }
  ```

### `GET /api/teacher/courses/:id/students`
Retrieves list of students enrolled in the specified course.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "students": [
      {
        "_id": "60d0fe4f53112b32f8312011",
        "name": "Jane Doe",
        "email": "jane@example.com"
      }
    ]
  }
  ```

### `POST /api/teacher/materials`
Uploads a study material file (e.g. PDF, slides) to a course.
- **Access:** Teacher only
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `courseId` (string, required)
  - `title` (string, required)
  - `file` (file, required)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "material": {
      "_id": "60d0fe4f53112b32f8312055",
      "courseId": "60d0fe4f53112b32f8312033",
      "title": "Lecture 1 Slides",
      "file": "uploads/materials-1624301135.pdf",
      "fileType": "pdf",
      "uploadedAt": "2026-06-14T12:00:00.000Z"
    }
  }
  ```

### `DELETE /api/teacher/materials/:id`
Deletes a course material.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Material deleted successfully"
  }
  ```

---

## 4. Student Actions (`/api/student`)

All routes in this section require the user to have the `student` role.

### `GET /api/student/courses`
Retrieves all courses in which the logged-in student is enrolled.
- **Access:** Student only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "courses": [
      {
        "_id": "60d0fe4f53112b32f8312033",
        "name": "Computer Networks",
        "code": "CS401",
        "department": "Computer Science",
        "year": 4,
        "createdBy": {
          "_id": "60d0fe4f53112b32f8312022",
          "name": "John Teacher",
          "email": "teacher@example.com"
        },
        "isArchived": false,
        "cover": "uploads/custom-cover.png",
        "students": ["60d0fe4f53112b32f8312011"]
      }
    ]
  }
  ```

### `POST /api/student/courses/join`
Enrolls the logged-in student into a course using a course code.
- **Access:** Student only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "coursecode": "CS401"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Successfully joined the course",
    "course": {
      "_id": "60d0fe4f53112b32f8312033",
      "name": "Computer Networks",
      "code": "CS401",
      "department": "Computer Science",
      "year": 4
    }
  }
  ```

### `GET /api/student/courses/:courseId/materials`
Retrieves all upload materials for a course (must be enrolled).
- **Access:** Student only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "materials": [
      {
        "_id": "60d0fe4f53112b32f8312055",
        "courseId": "60d0fe4f53112b32f8312033",
        "title": "Lecture 1 Slides",
        "file": "uploads/materials-1624301135.pdf",
        "fileType": "pdf",
        "uploadedAt": "2026-06-14T12:00:00.000Z"
      }
    ]
  }
  ```

### `GET /api/student/stats`
Gets student dashboard stats.
- **Access:** Student only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "stats": {
      "enrolledCourses": 4,
      "tasks": 12,
      "quizzes": 5
    }
  }
  ```

---

## 5. Quiz Operations (`/api/quizzes`)

These endpoints require authentication. Some actions are role-specific.

### `GET /api/quizzes/course/:courseId`
Gets all quizzes for a specific course.
- **Access:** Student or Teacher (Enrolled/Created)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "quizzes": [
      {
        "_id": "60d0fe4f53112b32f8312077",
        "courseId": "60d0fe4f53112b32f8312033",
        "title": "Midterm Exam Prep",
        "status": "active",
        "questionsCount": 10,
        "timeLimit": 30,
        "dueDate": "2026-06-20T23:59:59.000Z"
      }
    ]
  }
  ```

### `POST /api/quizzes`
Creates a new quiz (with questions included).
- **Access:** Teacher only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "courseId": "60d0fe4f53112b32f8312033",
    "title": "Networks Quiz 1",
    "dueDate": "2026-06-25T23:59:59.000Z",
    "timeLimit": 15,
    "questions": [
      {
        "text": "What does IP stand for?",
        "options": ["Internet Protocol", "Internal Program", "Instant Process", "Intranet Page"],
        "correctAnswer": "Internet Protocol",
        "points": 2
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "quiz": {
      "_id": "60d0fe4f53112b32f8312077",
      "courseId": "60d0fe4f53112b32f8312033",
      "title": "Networks Quiz 1",
      "status": "active",
      "questionsCount": 1,
      "timeLimit": 15,
      "createdBy": "60d0fe4f53112b32f8312022"
    },
    "questions": [ ... ]
  }
  ```

### `GET /api/quizzes/:id`
Retrieves full details of a quiz, including questions and correct answers.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "quiz": { ... },
    "questions": [
      {
        "_id": "60d0fe4f53112b32f8312088",
        "text": "What does IP stand for?",
        "options": ["Internet Protocol", "Internal Program", "Instant Process", "Intranet Page"],
        "correctAnswer": "Internet Protocol",
        "points": 2
      }
    ]
  }
  ```

### `PUT /api/quizzes/:id`
Edits a quiz (updates title, status, limit, etc.).
- **Access:** Teacher only
- **Request Body:**
  ```json
  {
    "title": "Networks Quiz 1 (Updated)",
    "status": "active",
    "timeLimit": 20,
    "dueDate": "2026-06-26T23:59:59.000Z"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "quiz": { ... }
  }
  ```

### `DELETE /api/quizzes/:id`
Deletes a quiz and all its questions/submissions.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Quiz and all associated questions/submissions deleted successfully"
  }
  ```

### `GET /api/quizzes/:id/submissions`
Gets all student submissions for a specific quiz.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "submissions": [
      {
        "_id": "60d0fe4f53112b32f8312099",
        "quizId": "60d0fe4f53112b32f8312077",
        "studentId": {
          "_id": "60d0fe4f53112b32f8312011",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "score": 2,
        "completionStatus": "completed",
        "submittedAt": "2026-06-14T12:05:00.000Z"
      }
    ]
  }
  ```

### `GET /api/quizzes/:id/take`
Retrieves a quiz structure for a student to attempt. **Note: The correct answers are omitted from this response to prevent cheating.**
- **Access:** Student only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "quiz": {
      "_id": "60d0fe4f53112b32f8312077",
      "title": "Networks Quiz 1",
      "timeLimit": 15,
      "dueDate": "2026-06-25T23:59:59.000Z"
    },
    "questions": [
      {
        "_id": "60d0fe4f53112b32f8312088",
        "text": "What does IP stand for?",
        "options": ["Internet Protocol", "Internal Program", "Instant Process", "Intranet Page"],
        "points": 2
      }
    ],
    "hasSubmitted": false
  }
  ```

### `POST /api/quizzes/:id/submit`
Submits a student's answers for grading. The API automatically calculates the score based on correct answers and returns the final score.
- **Access:** Student only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "answers": [
      {
        "questionId": "60d0fe4f53112b32f8312088",
        "answer": "Internet Protocol"
      }
    ]
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Quiz submitted successfully",
    "submission": {
      "quizId": "60d0fe4f53112b32f8312077",
      "studentId": "60d0fe4f53112b32f8312011",
      "answers": [ ... ],
      "score": 2,
      "completionStatus": "completed",
      "submittedAt": "2026-06-14T12:15:00.000Z"
    }
  }
  ```

---

## 6. Assignment Operations (`/api/assignments`)

These endpoints require authentication. Some actions are role-specific.

### `GET /api/assignments/course/:courseId`
Gets all assignments for a specific course.
- **Access:** Student or Teacher (Enrolled/Created)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "assignments": [
      {
        "_id": "60d0fe4f53112b32f8312111",
        "courseId": "60d0fe4f53112b32f8312033",
        "title": "Build a simple TCP Server",
        "description": "Implement a simple socket-based TCP server in Python.",
        "status": "active",
        "dueDate": "2026-06-22T23:59:59.000Z",
        "createdBy": "60d0fe4f53112b32f8312022"
      }
    ]
  }
  ```

### `POST /api/assignments`
Creates a new assignment.
- **Access:** Teacher only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "courseId": "60d0fe4f53112b32f8312033",
    "title": "Build a simple TCP Server",
    "description": "Implement a simple socket-based TCP server in Python.",
    "dueDate": "2026-06-22T23:59:59.000Z"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "assignment": {
      "_id": "60d0fe4f53112b32f8312111",
      "courseId": "60d0fe4f53112b32f8312033",
      "title": "Build a simple TCP Server",
      "description": "Implement a simple socket-based TCP server in Python.",
      "status": "active",
      "dueDate": "2026-06-22T23:59:59.000Z",
      "createdBy": "60d0fe4f53112b32f8312022"
    }
  }
  ```

### `PUT /api/assignments/:id`
Edits an assignment's title, description, or due date.
- **Access:** Teacher only
- **Request Body:**
  ```json
  {
    "title": "TCP Server Assignment v2",
    "description": "New instructions: ...",
    "dueDate": "2026-06-24T23:59:59.000Z"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "assignment": { ... }
  }
  ```

### `DELETE /api/assignments/:id`
Deletes an assignment and all its submissions.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Assignment deleted successfully"
  }
  ```

### `GET /api/assignments/:id/submissions`
Gets all student submissions for a specific assignment.
- **Access:** Teacher only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "submissions": [
      {
        "_id": "60d0fe4f53112b32f8312122",
        "assignmentId": "60d0fe4f53112b32f8312111",
        "studentId": {
          "_id": "60d0fe4f53112b32f8312011",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "submittedFile": "uploads/assignments-1624301135.zip",
        "submittedText": "Here is my code submission.",
        "completionStatus": "pending",
        "score": 0,
        "submittedAt": "2026-06-14T12:00:00.000Z"
      }
    ]
  }
  ```

### `PUT /api/assignments/submissions/:submissionId/grade`
Grades a student's assignment submission.
- **Access:** Teacher only
- **Content-Type:** `application/json`
- **Request Body:**
  ```json
  {
    "score": 95,
    "completionStatus": "approved" 
  }
  ```
  *(Note: `completionStatus` can be `"approved"` or `"rejected"`)*
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Submission graded successfully",
    "submission": { ... }
  }
  ```

### `POST /api/assignments/:id/submit`
Submits a student's work for an assignment (supports file uploading).
- **Access:** Student only
- **Content-Type:** `multipart/form-data`
- **Request Body:**
  - `submittedText` (string, optional)
  - `file` (file, optional)
- **Response (200 OK / 201 Created):**
  ```json
  {
    "success": true,
    "message": "Assignment submitted successfully",
    "submission": {
      "_id": "60d0fe4f53112b32f8312122",
      "assignmentId": "60d0fe4f53112b32f8312111",
      "studentId": "60d0fe4f53112b32f8312011",
      "submittedFile": "uploads/assignments-1624301135.zip",
      "submittedText": "Here is my code submission.",
      "completionStatus": "pending",
      "score": 0,
      "submittedAt": "2026-06-14T12:00:00.000Z"
    }
  }
  ```

### `GET /api/assignments/:id/submission`
Gets the logged-in student's own submission for a specific assignment.
- **Access:** Student only
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "submission": {
      "_id": "60d0fe4f53112b32f8312122",
      "assignmentId": "60d0fe4f53112b32f8312111",
      "studentId": "60d0fe4f53112b32f8312011",
      "submittedFile": "uploads/assignments-1624301135.zip",
      "submittedText": "Here is my code submission.",
      "completionStatus": "pending",
      "score": 0,
      "submittedAt": "2026-06-14T12:00:00.000Z"
    }
  }
  ```
