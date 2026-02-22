# Database Schema

This project uses MongoDB as the primary database. 

## Data Types Reference
* **ObjectId**: MongoDB's automatically generated unique identifier.
* **String**: Text data.
* **Number**: Numeric values (integers and floats).
* **Boolean**: `true` or `false`.
* **Array**: A list of items.
* **Date**: ISO 8601 formatted timestamp string.
* **Mixed**: Arbitrary JSON object for flexible data structures.

## Collections

### 1. Quiz (Quiz Templates)
Stores the quiz templates created by teachers, including the actual questions.

| Field         | Type     | Required | Description                                                  |
| :------------ | :------- | :------: | :----------------------------------------------------------- |
| `_id`         | ObjectId |    ✅     | Unique identifier                                            |
| `name`        | String   |    ✅     | Quiz name                                                    |
| `description` | String   |    ❌     | Optional remarks or instructions                             |
| `questions`   | Mixed    |    ✅     | Questions stored in a specific JSON format (see [here](./quiz_format.md)) |
| `createdAt`   | Date     |    ✅     | Creation timestamp                                           |
| `updatedAt`   | Date     |    ✅     | Last modified timestamp                                      |

### 2. Entrance (Exam Sessions)
Stores the distribution instances of a quiz, controlling specific exam sessions.

| Field        | Type     | Required | Description                                                  |
| :----------- | :------- | :------: | :----------------------------------------------------------- |
| `_id`        | ObjectId |    ✅     | Unique identifier                                            |
| `quizId`     | ObjectId |    ✅     | Reference to the template `Quiz`                             |
| `accessCode` | String   |    ✅     | Unique 4-character uppercase alphanumeric code distributed to students |
| `name`       | String   |    ✅     | Entrance name                                                |
| `description` | String   |    ❌     | Optional remarks or instructions                             |
| `isActive`   | Boolean  |    ✅     | Whether the exam is currently open for access                |
| `createdAt`   | Date     |    ✅     | Creation timestamp                                           |
| `updatedAt`   | Date     |    ✅     | Last modified timestamp                                        |

### 3. Submission (Student Records)
Stores the submitted answers and final scores of the students.

| Field         | Type     | Required | Description                                                  |
| :------------ | :------- | :------: | :----------------------------------------------------------- |
| `_id`         | ObjectId |    ✅     | Unique identifier                                            |
| `entranceId`  | ObjectId |    ✅     | Reference to the specific `Entrance`                         |
| `studentName` | String   |    ✅     | Name of the student                                          |
| `answers`     | Mixed    |    ✅     | Student submitted answers stored in a specific JSON format (see [here](./answer_format.md)) |
| `totalScore`  | Number   |    ✅     | Total score calculated by the system                         |
| `submittedAt` | Date     |    ✅     | Timestamp of the final submission                            |

---

## Entity Relationship (ER) Diagram

```mermaid
erDiagram
    QUIZ ||--o{ ENTRANCE : "generates"
    ENTRANCE ||--o{ SUBMISSION : "receives"

    QUIZ {
        ObjectId _id PK
        String name
        String description
        Mixed questions
        Date createdAt
        Date updatedAt
    }

    ENTRANCE {
        ObjectId _id PK
        ObjectId quizId FK
        String accessCode
        String name
        String description
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    SUBMISSION {
        ObjectId _id PK
        ObjectId entranceId FK
        String studentName
        Mixed answers
        Number totalScore
        Date submittedAt
    }