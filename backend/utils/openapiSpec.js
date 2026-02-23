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
            },
            Entrance: {
                type: 'object',
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
        }
    },
}

module.exports = spec