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
                    200: { description: 'Returns an array of all quiz templates' },
                    401: { description: 'Token missing or invalid' },
                },
            },
        },
    },
}

module.exports = spec