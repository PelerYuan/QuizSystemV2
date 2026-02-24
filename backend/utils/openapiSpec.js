const spec = {
    openapi: '3.1.0',
    info: {
        title: 'Quiz System API Reference',
        version: '1.0.0',
        description: 'Modern API documentation powered by Scalar.',
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
        schemas: {
            Quiz: {
                type: 'object',
                // ADDED: 'id' is always present in DB responses
                required: ['id', 'name', 'questions'],
                properties: {
                    id: { type: 'string', example: '65abc123def4567890abcdef' },
                    name: { type: 'string', example: 'Midterm Python Fundamentals' },
                    description: { type: 'string', example: 'Covers basic Python concepts for Term 2' },
                    questions: {
                        type: 'object',
                        description: 'Flexible JSON object matching the Quiz Data Format specification',
                        example: {
                            title: 'PYTHON QUIZ TRIAL',
                            points: 1,
                            questions: [
                                { Q: 'What is the value?', options: [{ opt: 'a', correct: true }] }
                            ]
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Entrance: {
                type: 'object',
                // ADDED: Strict required array based on schema.md
                required: ['id', 'quizId', 'accessCode', 'name', 'isActive'],
                properties: {
                    id: { type: 'string', example: '65xyz987def4567890uvwxyz' },
                    quizId: {
                        type: 'object',
                        description: 'Populated Quiz object containing at least the ID and name',
                        example: { id: '65abc123def4567890abcdef', name: 'Midterm Python Fundamentals' }
                    },
                    accessCode: { type: 'string', example: 'ABCD', description: 'Auto-generated 4-character uppercase code' },
                    name: { type: 'string', example: 'Monday Morning Session' },
                    description: { type: 'string', example: 'For Class A students' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            SubmissionResult: {
                type: 'object',
                // ADDED: Strict required array ensuring frontend receives all necessary result data
                required: ['submissionId', 'studentName', 'totalScore', 'entranceName', 'quizTitle', 'quizQuestions', 'studentAnswers'],
                properties: {
                    submissionId: { type: 'string', example: '65sub123def4567890abcdef' },
                    studentName: { type: 'string', example: 'John Doe' },
                    totalScore: { type: 'number', example: 10 },
                    submittedAt: { type: 'string', format: 'date-time' },
                    entranceName: { type: 'string', example: 'Monday Morning Session' },
                    quizTitle: { type: 'string', example: 'Midterm Python Fundamentals' },
                    quizQuestions: { type: 'object', description: 'The original quiz questions, including correct answers.' },
                    studentAnswers: { type: 'object', description: 'The graded answers matching the Answer Data Format.' }
                }
            }
        }
    },
    paths: {
        '/api/auth/login': {
            post: {
                summary: 'Admin Login',
                tags: ['Authentication'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['password'], // Ensured password is required in body
                                properties: { password: { type: 'string', example: '123456' } },
                            },
                        },
                    },
                },
                responses: {
                    200: { description: 'Successful login returns JWT token' },
                    401: { description: 'Invalid password' },
                },
            },
        },
        '/api/auth/me': {
            get: {
                summary: 'Get Current Role',
                tags: ['Authentication'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Returns the role of the authenticated user' },
                    401: { description: 'Token missing or invalid' },
                },
            },
        },
        '/api/auth/logout': {
            post: {
                summary: 'Admin Logout',
                tags: ['Authentication'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Logged out successfully' },
                    401: { description: 'Token missing or invalid' },
                },
            },
        },
        '/api/quizzes': {
            get: {
                summary: 'Get All Quizzes',
                tags: ['Quiz Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Returns an array of all quiz templates',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } }
                            }
                        }
                    },
                    401: { description: 'Token missing or invalid' },
                },
            },
            post: {
                summary: 'Create a New Quiz',
                tags: ['Quiz Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'questions'],
                                properties: {
                                    name: { type: 'string', example: 'New Quiz Name' },
                                    description: { type: 'string', example: 'Optional description' },
                                    questions: { type: 'object', description: 'JSON object containing quiz structure' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Quiz successfully created',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } }
                    },
                    400: { description: 'Validation error (missing required fields)' },
                    401: { description: 'Token missing or invalid' }
                }
            }
        },
        '/api/quizzes/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The MongoDB ObjectId of the Quiz',
                    schema: { type: 'string' }
                }
            ],
            get: {
                summary: 'Get a Specific Quiz',
                tags: ['Quiz Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Returns the requested quiz template',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } }
                    },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Quiz not found' }
                }
            },
            put: {
                summary: 'Update an Existing Quiz',
                tags: ['Quiz Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'questions'],
                                properties: {
                                    name: { type: 'string', example: 'Updated Quiz Name' },
                                    description: { type: 'string', example: 'Updated description' },
                                    questions: { type: 'object' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Quiz successfully updated',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } }
                    },
                    400: { description: 'Validation error (name and questions strictly required)' },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Quiz not found' }
                }
            },
            delete: {
                summary: 'Delete a Quiz',
                description: 'Deletes a quiz template and cascades deletion to all associated Entrances and Submissions.',
                tags: ['Quiz Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    204: { description: 'Quiz successfully deleted (No Content)' },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Quiz not found' }
                }
            }
        },
        '/api/entrances': {
            get: {
                summary: 'Get All Entrances',
                description: 'Returns all exam sessions. The parent quizId is populated with the quiz name.',
                tags: ['Entrance Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Returns an array of entrances',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Entrance' } } } }
                    },
                    401: { description: 'Token missing or invalid' }
                }
            },
            post: {
                summary: 'Create a New Exam Session',
                description: 'Generates a new Entrance with an auto-generated 4-character accessCode.',
                tags: ['Entrance Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['quizId', 'name', 'isActive'],
                                properties: {
                                    quizId: { type: 'string', example: '65abc123def4567890abcdef' },
                                    name: { type: 'string', example: 'New Exam Session' },
                                    description: { type: 'string', example: 'Optional description' },
                                    isActive: { type: 'boolean', example: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Entrance successfully created',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Entrance' } } }
                    },
                    400: { description: 'Validation error (missing strictly required fields)' },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Referenced quiz not found' }
                }
            }
        },
        '/api/entrances/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'The MongoDB ObjectId of the Entrance',
                    schema: { type: 'string' }
                }
            ],
            put: {
                summary: 'Update / Toggle Entrance',
                description: 'Allows partial updates to the Entrance, primarily used to toggle the `isActive` status.',
                tags: ['Entrance Management'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                // Note: Intentionally left 'required' out here since PUT /entrances allows partial toggles
                                properties: {
                                    name: { type: 'string', example: 'Updated Exam Name' },
                                    description: { type: 'string', example: 'Updated description' },
                                    isActive: { type: 'boolean', example: false }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Entrance successfully updated',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/Entrance' } } }
                    },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Entrance not found' }
                }
            },
            delete: {
                summary: 'Delete an Entrance',
                description: 'Deletes an entrance and cascades deletion to all associated student Submissions.',
                tags: ['Entrance Management'],
                security: [{ bearerAuth: [] }],
                responses: {
                    204: { description: 'Entrance successfully deleted (No Content)' },
                    401: { description: 'Token missing or invalid' },
                    404: { description: 'Entrance not found' }
                }
            }
        },
        '/api/exam/entrance/{accessCode}': {
            parameters: [
                {
                    name: 'accessCode',
                    in: 'path',
                    required: true,
                    description: 'The 4-character auto-generated exam code',
                    schema: { type: 'string', example: 'ABCD' }
                }
            ],
            get: {
                summary: 'Access Exam Session',
                description: 'Validates the access code and returns the exam questions. **Anti-cheating feature:** Standard correct answers are stripped from the payload.',
                tags: ['Student Exam Execution'],
                security: [],
                responses: {
                    200: {
                        description: 'Returns the safe version of the quiz along with entrance metadata',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['entranceId', 'entranceName', 'quiz'],
                                    properties: {
                                        entranceId: { type: 'string' },
                                        entranceName: { type: 'string' },
                                        quiz: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    403: { description: 'Exam session is currently closed' },
                    404: { description: 'Invalid access code or associated quiz not found' }
                }
            }
        },
        '/api/exam/submit': {
            post: {
                summary: 'Submit Exam Answers',
                description: 'Accepts student answers and performs auto-grading. Calculates the final score server-side to prevent tampering.',
                tags: ['Student Exam Execution'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['entranceId', 'studentName', 'answers'],
                                properties: {
                                    entranceId: { type: 'string', example: '65xyz987def4567890uvwxyz' },
                                    studentName: { type: 'string', example: 'John Doe' },
                                    answers: {
                                        type: 'object',
                                        description: 'Object matching the Answer Data Format specification',
                                        example: {
                                            questions: [
                                                { selections: ["A"] },
                                                { answer: "Text response" }
                                            ]
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Successfully graded and saved the submission',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['submissionId'],
                                    properties: { submissionId: { type: 'string', example: '65sub123def4567890abcdef' } }
                                }
                            }
                        }
                    },
                    400: { description: 'Missing required payload fields' },
                    403: { description: 'Exam is closed, submissions are no longer accepted' },
                    404: { description: 'Entrance not found' }
                }
            }
        },
        '/api/exam/result/{submissionId}': {
            parameters: [
                {
                    name: 'submissionId',
                    in: 'path',
                    required: true,
                    description: 'The MongoDB ObjectId of the completed Submission',
                    schema: { type: 'string' }
                }
            ],
            get: {
                summary: 'Get Student Results',
                description: 'Retrieves a specific student\'s final score, their answers, and the original quiz questions with the correct options included.',
                tags: ['Student Exam Execution'],
                security: [],
                responses: {
                    200: {
                        description: 'Returns the detailed test results and parsed quiz structure',
                        content: { 'application/json': { schema: { $ref: '#/components/schemas/SubmissionResult' } } }
                    },
                    404: { description: 'Submission not found' }
                }
            }
        }
    },
}

module.exports = spec