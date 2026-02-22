# Answer Data Format Specification

## Overview

This document outlines the standard JSON schema used for storing and parsing submitted answers within the system.

## 1. Root Metadata Object

The top-level JSON object defines the global configuration and metadata for the quiz.

| Field        | Type   | Required | Description                                                |
| :----------- | :----- | :------: | :--------------------------------------------------------- |
| `point`      | Number |    ✅     | The default point value assigned to each question          |
| `totalScore` | Number |    ✅     | The final total score calculated based on the answers      |
| `questions`  | Array  |    ✅     | An array of student answers and points earned per question |

## 2. Question Object Structure

The `questions` array contains objects that represent individual question selections and awarded points. 

### Type A: Multiple Choice Questions (MCQ)

Identified by the presence of the `options` array.

| Field        | Type   | Required | Description                                                  |
| :----------- | :----- | :------: | :----------------------------------------------------------- |
| `selections` | Array  |    ✅     | An array of selected answers                                 |
| `point`      | Number |    ✅     | Points earned for this question (prorated for multiple-response items) |

### Type B: Fill-in-the-Blank / Text Input

Identified by the presence of the `itext` key. Typically used when the prompt `Q` contains blank spaces (e.g., `___`).

| Field    | Type   | Required | Description                                                  |
| :------- | :----- | :------: | :----------------------------------------------------------- |
| `answer` | String |    ✅     | The textual response submitted by the student for this question |

***Note**: System auto-grading is disabled for subjective text-input items.*

## 3. JSON Example Snippet

```json
{
    "point": 1,
    "totalScore": 5,
    "questions": [
        {
            "selections": [
                "A. Python",
                "B. Java",
                "D. Javascript"
            ],
            "point": 0.75
        },
        {
            "answer": "Programming is amazing"
        }
    ]
}
```