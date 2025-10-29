const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const rateLimiter = require('./middleware/rateLimiter');
const { validationErrorHandler } = require('./middleware/validation');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.use('/api', routes);

app.use(validationErrorHandler);
app.use(errorHandler);

app.use((req, res) => {
  logger.warn('Route not found: %s %s', req.method, req.originalUrl);
  res.status(404).json({ message: 'Not Found' });
});

module.exports = app;
