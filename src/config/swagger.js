import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bersulm API',
      version: '1.0.0',
      description: 'Backend REST API para BERSULM — app de barbería premium'
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            code: { type: 'string' }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['client', 'admin'] }
          }
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            durationMin: { type: 'integer' },
            icon: { type: 'string' },
            category: { type: 'string' },
            isActive: { type: 'boolean' },
            order: { type: 'integer' }
          }
        },
        Appointment: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            serviceId: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            status: { type: 'string', enum: ['confirmed', 'cancelled', 'completed'] },
            notes: { type: 'string' },
            totalPrice: { type: 'number' }
          }
        },
        GalleryItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            imageUrl: { type: 'string' },
            title: { type: 'string' },
            category: { type: 'string' },
            isActive: { type: 'boolean' },
            order: { type: 'integer' }
          }
        },
        Raffle: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            month: { type: 'string' },
            status: { type: 'string', enum: ['voting', 'active', 'completed'] },
            raffleDate: { type: 'string', format: 'date-time' },
            winnerReward: { type: 'string' },
            participants: { type: 'array', items: { type: 'string' } }
          }
        },
        LoyaltyCard: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            visits: { type: 'integer' },
            totalVisits: { type: 'integer' },
            status: { type: 'string', enum: ['active', 'reward_pending', 'claimed'] }
          }
        },
        Reward: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            icon: { type: 'string' },
            type: { type: 'string' },
            isActive: { type: 'boolean' }
          }
        }
      }
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' },
                    phone: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: { 201: { description: 'User created' }, 409: { description: 'User already exists' } }
        }
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } }
              }
            }
          },
          responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } }
        }
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh access token',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } }
            }
          },
          responses: { 200: { description: 'Token refreshed' }, 401: { description: 'Invalid refresh token' } }
        }
      },
      '/services': {
        get: {
          tags: ['Services'],
          summary: 'Get all services',
          responses: { 200: { description: 'List of services' } }
        },
        post: {
          tags: ['Services'],
          summary: 'Create a service',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Service created' } }
        }
      },
      '/services/{id}': {
        get: {
          tags: ['Services'],
          summary: 'Get service by ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Service found' } }
        },
        put: {
          tags: ['Services'],
          summary: 'Update a service',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Service updated' } }
        },
        delete: {
          tags: ['Services'],
          summary: 'Delete a service',
          security: [{ bearerAuth: [] }],
          responses: { 204: { description: 'Service deleted' } }
        }
      },
      '/appointments': {
        post: {
          tags: ['Appointments'],
          summary: 'Create an appointment',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Appointment created' } }
        }
      },
      '/appointments/slots': {
        get: {
          tags: ['Appointments'],
          summary: 'Get available slots',
          parameters: [{ name: 'date', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Available slots' } }
        }
      },
      '/appointments/user': {
        get: {
          tags: ['Appointments'],
          summary: 'Get user appointments',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User appointments' } }
        }
      },
      '/appointments/{id}/cancel': {
        put: {
          tags: ['Appointments'],
          summary: 'Cancel an appointment',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Appointment cancelled' } }
        }
      },
      '/gallery': {
        get: {
          tags: ['Gallery'],
          summary: 'Get all gallery items',
          responses: { 200: { description: 'Gallery items' } }
        },
        post: {
          tags: ['Gallery'],
          summary: 'Create a gallery item',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Gallery item created' } }
        }
      },
      '/gallery/{id}': {
        delete: {
          tags: ['Gallery'],
          summary: 'Delete a gallery item',
          security: [{ bearerAuth: [] }],
          responses: { 204: { description: 'Gallery item deleted' } }
        }
      },
      '/rewards': {
        get: { tags: ['Rewards'], summary: 'Get all rewards', responses: { 200: { description: 'List of rewards' } } },
        post: {
          tags: ['Rewards'],
          summary: 'Create a reward',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Reward created' } }
        }
      },
      '/raffles/current': {
        get: { tags: ['Raffles'], summary: 'Get current raffle', responses: { 200: { description: 'Current raffle' } } }
      },
      '/raffles/vote': {
        post: {
          tags: ['Raffles'],
          summary: 'Vote for a reward',
          security: [{ bearerAuth: [] }],
          responses: { 201: { description: 'Vote registered' } }
        }
      },
      '/raffles/votes': {
        get: {
          tags: ['Raffles'],
          summary: 'Get raffle votes',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Votes' } }
        }
      },
      '/raffles/spin': {
        post: {
          tags: ['Raffles'],
          summary: 'Spin raffle winner',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Winner selected' } }
        }
      },
      '/loyalty': {
        get: {
          tags: ['Loyalty'],
          summary: 'Get loyalty card',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Loyalty card' } }
        }
      },
      '/loyalty/claim': {
        post: {
          tags: ['Loyalty'],
          summary: 'Claim reward',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Reward claimed' } }
        }
      },
      '/loyalty/spin': {
        post: {
          tags: ['Loyalty'],
          summary: 'Spin for random reward',
          responses: { 200: { description: 'Random reward' } }
        }
      }
    }
  },
  apis: []
};

export default swaggerJsdoc(options);
