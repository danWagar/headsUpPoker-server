require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const authRouter = require('./auth/auth-router');
const userRouter = require('./user/user-router');
const gameRouter = require('./game/game-router');
const betRouter = require('./bet/bet-router');
const handRouter = require('./hand/hand-router');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
  })
);
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
  res.send('Hello boilerplate');
});

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/game', gameRouter);
app.use('/api/bet', betRouter);
app.use('/api/hand', handRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
