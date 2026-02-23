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
                required: ['name', 'questions'],
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
        }
    },
}

module.exports = spec