const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.options('*', cors());
app.use(cors());

app.use(require('./controllers'));

app.use(require('./middlewares/error-handler'));

module.exports = app;
