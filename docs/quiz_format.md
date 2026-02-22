# Quiz Data Format Specification

## Overview
This document outlines the standard JSON schema used for storing and parsing quiz templates within the system. The format is designed to be lightweight and flexible, supporting both Multiple Choice (MCQ) and Fill-in-the-blank/Short Answer question types. 

## 1. Root Metadata Object
The top-level JSON object defines the global configuration and metadata for the quiz.

| Field         | Type   | Required | Description                                                  |
| :------------ | :----- | :------: | :----------------------------------------------------------- |
| `title`       | String |    ✅     | The main title of the quiz (e.g., "PYTHON QUIZ TRIAL")       |
| `subtitle`    | String |    ❌     | The secondary title or term grouping (e.g., "Term 2")        |
| `description` | String |    ❌     | General description or internal reference ID (e.g., "66")    |
| `points`      | Number |    ✅     | The default point value assigned to each question            |
| `questions`   | Array  |    ✅     | An array of question objects containing the actual quiz content |

## 2. Question Object Structure
The `questions` array contains objects that represent individual questions. The system determines the **Question Type** based on the presence of specific keys (`options` vs. `itext`).

### Shared Field
| Field   | Type   | Required | Description                                                  |
| :------ | :----- | :------: | :----------------------------------------------------------- |
| `Q`     | String |    ✅     | The main question text or prompt                             |
| `image` | String |    ❌     | The unique filename of the image associated with the question |

### Type A: Multiple Choice Questions (MCQ)
Identified by the presence of the `options` array.

| Field     | Type  | Required | Description                |
| :-------- | :---- | :------: | :------------------------- |
| `options` | Array |    ✅     | An array of choice objects |

**Option Object Details:**

| Field     | Type    | Required | Description                             |
| :-------- | :------ | :------: | :-------------------------------------- |
| `opt`     | String  |    ✅     | The text of the choice (e.g., "A. Jia") |
| `correct` | Boolean |    ❌     | Indicates the correct answer            |

### Type B: Fill-in-the-Blank / Text Input
Identified by the presence of the `itext` key. Typically used when the prompt `Q` contains blank spaces (e.g., `___`).

| Field   | Type   | Required | Description                                                  |
| :------ | :----- | :------: | :----------------------------------------------------------- |
| `itext` | String |    ✅     | Serves as a placeholder for text input. In the template, this is usually an empty string `""`. |


## 3. JSON Example Snippet
```json
{
    "title": "PYTHON QUIZ TRIAL",
    "subtitle": "Term 2",
    "points": 1,
    "questions": [
        {
            "Q": "What is the value of new_number variable?",
            "image": "7e8deb56-52f8-4472-a115-e9b1cd51214f.png",
            "options": [
                { "opt": "a. 21" },
                { "opt": "b. 33", "correct": true },
                { "opt": "c. 11" }
            ]
        },
        {
            "Q": "Fill the ___ in the following code:",
            "itext": ""
        }
    ]
}