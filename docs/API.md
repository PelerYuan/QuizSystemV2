# RESTful API Inventory

## Overview

This document defines the backend API endpoints required to support the React frontend.

**Base URL:** `/api`

## 1. Authentication (`/auth`)

Handles teacher/administrator access.

| Method | Endpoint       | Auth Required | Frontend Route  | Description                                                                 |
|:-------|:---------------|:-------------:|:----------------|:----------------------------------------------------------------------------|
| `POST` | `/auth/login`  |       ❌       | `/admin/login`  | Validates admin credentials and returns a JWT token                         |
| `POST` | `/auth/logout` |       ✅       | (Navbar/Header) | Invalidates the current session/token                                       |
| `GET`  | `/auth/me`     |       ✅       | (App Router)    | Verifies the validity of the current token (used by React `<PrivateRoute>`) |

## 2. Quiz Management (`/quizzes`)

Handles the creation, editing, and retrieval of Quiz Templates (Admin only).

| Method   | Endpoint           | Auth Required | Frontend Route                                    | Description                                                                        |
|:---------|:-------------------|:-------------:|:--------------------------------------------------|:-----------------------------------------------------------------------------------|
| `GET`    | `/quizzes`         |       ✅       | `/admin/dashboard`                                | Returns a list of all quizzes                                                      |
| `POST`   | `/quizzes`         |       ✅       | `/admin/editor/new`                               | Creates a new quiz template. Accepts the [Quiz Data Format](./quiz_format.md) JSON |
| `GET`    | `/quizzes/:quizId` |       ✅       | `/admin/editor/:quizId`<br>`/admin/trial/:quizId` | Retrieves the full JSON payload of a specific quiz                                 |
| `PUT`    | `/quizzes/:quizId` |       ✅       | `/admin/editor/:quizId`                           | Updates an existing quiz                                                           |
| `DELETE` | `/quizzes/:quizId` |       ✅       | `/admin/dashboard`                                | Deletes a quiz (and cascades deletion to its Entrances/Submissions)                |

## 3. Entrance Management (`/entrances`)

Handles the distribution instances of quizzes (Admin only).

| Method   | Endpoint                 | Auth Required | Frontend Route     | Description                                                    |
|:---------|:-------------------------|:-------------:|:-------------------|:---------------------------------------------------------------|
| `GET`    | `/entrances`             |       ✅       | `/admin/dashboard` | Returns a list of all active/inactive exam entrances           |
| `POST`   | `/entrances`             |       ✅       | `/admin/dashboard` | Generates a new exam session                                   |
| `PUT`    | `/entrances/:entranceId` |       ✅       | `/admin/dashboard` | Toggles the `isActive` status of an entrance (Open/Close exam) |
| `DELETE` | `/entrances/:entranceId` |       ✅       | `/admin/dashboard` | Deletes an entrance and all its associated student submissions |

## 4. Admin Analytics (`/analytics`)

Handles result analysis for the teacher dashboard (Admin only).

| Method | Endpoint                          | Auth Required | Frontend Route              | Description                                                                                                                                |
|:-------|:----------------------------------|:-------------:|:----------------------------|:-------------------------------------------------------------------------------------------------------------------------------------------|
| `GET`  | `/analytics/entrance/:entranceId` |       ✅       | `/admin/result/:entranceId` | Returns aggregated statistics (pass rate, average score, score distribution) and a list of all student submissions for a specific entrance |
| `GET`  | `/analytics/export/:entranceId`   |       ✅       | `/admin/result/:entranceId` | Generates and downloads an Excel/CSV file of the results                                                                                   |

## 5. Student Exam Execution (`/exam`)

Public endpoints for students taking the quiz.

| Method | Endpoint                     | Auth Required | Frontend Route          | Description                                                                                                                                              |
|:-------|:-----------------------------|:-------------:|:------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------|
| `GET`  | `/exam/entrance/:accessCode` |       ❌       | `/exam/:accessCode`     | Validates the access code. If active, returns the associated Quiz questions                                                                              |
| `POST` | `/exam/submit`               |       ❌       | `/exam/:accessCode`     | Submits the student's answers (accepts the [Answer Data Format](./answer_format.md) JSON). Calculates the score and returns the generated `submissionId` |
| `GET`  | `/exam/result/:submissionId` |       ❌       | `/result/:submissionId` | Retrieves a specific student's final score and detailed feedback                                                                                         |

## 6. Media / Uploads (`/media` & `/uploads`)

Handles static assets like question images.

| Method | Endpoint                 | Auth Required | Frontend Route          | Description                                                                 |
|:-------|:-------------------------|:-------------:|:------------------------|:----------------------------------------------------------------------------|
| `POST` | `/media/upload`          |       ✅       | `/admin/editor/:quizId` | Uploads an image, returning a newly generated UUID filename                 |
| `GET`  | `/uploads/:filename.ext` |       ❌       | (Any view with images)  | Static file server. Directly fetches the uploaded image to render in React. |