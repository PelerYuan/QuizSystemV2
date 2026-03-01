# Frontend Routes

| Path                        | Access Level      | Description                                                  |
|:----------------------------| :---------------- | :----------------------------------------------------------- |
| `/`                         | Public            | The welcome page of the system                               |
| `/admin/login`              | Public (Teacher)  | Teacher/administrator authentication page                    |
| `/admin/dashboard`          | Private (Teacher) | Teacher's main control panel (displays all quizzes and entrances) |
| `/admin/edit/:quizId`     | Private (Teacher) | The interface for teachers to create or edit quiz content    |
| `/admin/trial/:quizId`      | Private (Teacher) | The interface for teachers to trial and preview quiz content |
| `/admin/result/:entranceId` | Private (Teacher) | Result analysis page, providing detailed information         |
| `/exam/:accessCode`         | Public (Student)  | The active quiz-taking interface for students                |
| `/result/:submissionId`     | Public (Student)  | The result page displayed after a successful submission.     |

> **Developer Note (Routing Implementation):** 
>
> For the `/admin/editor/:quizId` route, use the explicit string `new` as the `:quizId` parameter (i.e., `/admin/editor/new`) when a teacher is creating a brand new quiz. The frontend React component should evaluate `if (quizId === 'new')` to render a blank editing canvas. For any other valid ObjectId, the component should fetch and populate the existing quiz data from the API.