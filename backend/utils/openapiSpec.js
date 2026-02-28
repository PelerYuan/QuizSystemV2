const openapiSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Quiz Management API',
        description: 'Backend API for the React Quiz Management System, supporting teacher administration and student exam execution.',
        version: '1.0.0',
    },
    servers: [
        {
            url: '/api',
            description: 'Local development server proxy',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter your JWT token obtained from /auth/login',
            },
        },
        schemas: {
            Quiz: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    questions: { type: 'object', description: 'Mixed JSON format defining the quiz content' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Entrance: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    quizId: { type: 'string' },
                    accessCode: { type: 'string', description: '4-character uppercase alphanumeric code' },
                    name: { type: 'string' },
                    description: { type: 'string' },
                    isActive: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Submission: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    entranceId: { type: 'string' },
                    studentName: { type: 'string' },
                    answers: { type: 'object' },
                    totalScore: { type: 'number' },
                    submittedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    },
    paths: {
        // --- 1. Authentication ---
        '/auth/login': {
            post: {
                tags: ['Authentication'],
                summary: 'Admin Login',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { password: { type: 'string' } }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Successful login',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { token: { type: 'string' }, role: { type: 'string' } }
                                }
                            }
                        }
                    },
                    401: { description: 'Invalid password' }
                }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Authentication'],
                summary: 'Verify Token',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Token is valid' },
                    401: { description: 'Token missing or invalid' }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Authentication'],
                summary: 'Admin Logout',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Logged out successfully' }
                }
            }
        },

        // --- 2. Quiz Management ---
        '/quizzes': {
            get: {
                tags: ['Quizzes'],
                summary: 'Get all quizzes',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'List of quizzes',
                        content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Quiz' } } } }
                    }
                }
            },
            post: {
                tags: ['Quizzes'],
                summary: 'Create a new quiz template',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    questions: { type: 'object' }
                                },
                                required: ['name', 'questions']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Quiz created successfully' }
                }
            }
        },
        '/quizzes/{id}': {
            get: {
                tags: ['Quizzes'],
                summary: 'Get a specific quiz',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Quiz details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Quiz' } } } },
                    404: { description: 'Quiz not found' }
                }
            },
            put: {
                tags: ['Quizzes'],
                summary: 'Update a specific quiz',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { name: { type: 'string' }, description: { type: 'string' }, questions: { type: 'object' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Quiz updated successfully' },
                    400: { description: 'Missing required fields' }
                }
            },
            delete: {
                tags: ['Quizzes'],
                summary: 'Delete a quiz (Cascade deletes Entrances & Submissions)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Deleted successfully' },
                    404: { description: 'Quiz not found' }
                }
            }
        },

        // --- 3. Entrance Management ---
        '/entrances': {
            get: {
                tags: ['Entrances'],
                summary: 'Get all entrances',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'List of entrances' }
                }
            },
            post: {
                tags: ['Entrances'],
                summary: 'Create a new exam session (Entrance)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    quizId: { type: 'string' },
                                    name: { type: 'string' },
                                    description: { type: 'string' },
                                    isActive: { type: 'boolean' }
                                },
                                required: ['quizId', 'name', 'isActive']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Entrance created successfully' },
                    400: { description: 'Missing required fields' },
                    404: { description: 'Referenced quiz not found' }
                }
            }
        },
        '/entrances/{id}': {
            put: {
                tags: ['Entrances'],
                summary: 'Update an entrance (e.g. toggle isActive)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { name: { type: 'string' }, description: { type: 'string' }, isActive: { type: 'boolean' } }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Entrance updated successfully' },
                    404: { description: 'Entrance not found' }
                }
            },
            delete: {
                tags: ['Entrances'],
                summary: 'Delete an entrance (Cascade deletes Submissions)',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    204: { description: 'Deleted successfully' },
                    404: { description: 'Entrance not found' }
                }
            }
        },

        // --- 4. Analytics ---
        '/analytics/entrance/{entranceId}': {
            get: {
                tags: ['Analytics'],
                summary: 'Get flattened analytics dashboard data',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'entranceId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: {
                        description: 'Analytics payload including stats and flattened score list',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        entranceName: { type: 'string' },
                                        maxScore: { type: 'number' },
                                        totalStudents: { type: 'number' },
                                        averageScore: { type: 'number' },
                                        highestScore: { type: 'number' },
                                        lowestScore: { type: 'number' },
                                        scoreList: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    submissionId: { type: 'string' },
                                                    studentName: { type: 'string' },
                                                    totalScore: { type: 'number' },
                                                    submittedAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/analytics/export/{entranceId}': {
            get: {
                tags: ['Analytics'],
                summary: 'Export results as CSV',
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'entranceId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'CSV file download', content: { 'text/csv': {} } }
                }
            }
        },

        // --- 5. Student Exam Execution ---
        '/exam/entrance/{accessCode}': {
            get: {
                tags: ['Student Exam'],
                summary: 'Fetch an active quiz for a student',
                parameters: [{ name: 'accessCode', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Quiz payload (safe version without correct answers)' },
                    403: { description: 'Exam session closed' },
                    404: { description: 'Invalid access code' }
                }
            }
        },
        '/exam/submit': {
            post: {
                tags: ['Student Exam'],
                summary: 'Submit answers for grading',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    entranceId: { type: 'string' },
                                    studentName: { type: 'string' },
                                    answers: { type: 'object', description: 'Answers formatted per answer_format.md' }
                                },
                                required: ['entranceId', 'studentName', 'answers']
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Exam graded and submitted successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { submissionId: { type: 'string' } } } } }
                    }
                }
            }
        },
        '/exam/result/{submissionId}': {
            get: {
                tags: ['Student Exam'],
                summary: 'Get results for a specific submission',
                parameters: [{ name: 'submissionId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Detailed student result and feedback' },
                    404: { description: 'Submission not found' }
                }
            }
        },

        // --- 6. Media ---
        '/media/upload': {
            post: {
                tags: ['Media'],
                summary: 'Upload an image file',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: { image: { type: 'string', format: 'binary' } }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Image uploaded successfully',
                        content: { 'application/json': { schema: { type: 'object', properties: { filename: { type: 'string' }, url: { type: 'string' } } } } }
                    },
                    400: { description: 'Upload failed or file type not allowed' }
                }
            }
        }
    }
}

module.exports = openapiSpec;