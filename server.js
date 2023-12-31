const express = require('express');
const app = express();
const { auth } = require('express-openid-connect');
const { config } = require('./middleware/auth');
require('dotenv').config();

const mongoose = require('mongoose');
const Movie = require('./models/movie');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;
const coll = process.env.DB_COLLECTION;
const routes = require('./routes/movies-routes');
const cookieParser = require('cookie-parser');

// Use the middleware
app.use(cookieParser());
app.use(express.json());

// Require the connect function from db.js module and store it in a constant called connect
const { connect } = require('./db/db.js');

// Use an immediately-invoked function expression (IIFE) to connect to the database, then start the server
(async () => {
    try {
      // Call the connect function and store the returned connection object in app.locals.db
      const db = await connect(uri, dbName);
        app.locals.db = db;
        app.locals.uri = uri;
    } catch (err) {
      console.error('Error starting server:', err);
    }
})();

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use(routes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, { explorer: true }));

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
