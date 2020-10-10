let swaggerDefinition = {
    info: {
        title: 'Rendezvous API',
        description: 'API for food order and delivery application',
        version: '1.0.0',
        contact: {
            name: 'Shovan Raj Joshi'
        },
        servers: ['http://localhost:3000']
    },
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            name: 'authorization',
            in: 'header',
            scheme: 'bearer',
        }
    },
    host: 'localhost:3000',
    basePath: '/'
};

let swaggerOptions = {
    swaggerDefinition,
    apis: ['./Routes/*.js']
}

module.exports = swaggerOptions;