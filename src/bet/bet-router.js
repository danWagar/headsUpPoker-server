/* eslint-disable strict */
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');
const betService = require('./bet-service');

const betRouter = express.Router();
const jsonBodyParser = express.json();

betRouter.use(requireAuth);

betRouter.post('/', jsonBodyParser, async (req, res, next) => {
  const { hand_id, bet_type, current_player, current_amt, last_amt } = req.body;
  const newBet = { hand_id, bet_type, current_player, current_amt, last_amt };

  for (const field of ['hand_id', 'bet_type', 'current_player', 'current_amt', 'last_amt'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
  try {
    const hasBet = await betService.hasBetWithHandId(hand_id);

    if (hasBet)
      return res.status(404).json({
        error: `There is already a bet with this hand id`
      });

    const newBet = await betService.newBet(req.app.get('db'), newBet);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${newBet.id}`))
      .json({ betID: newBet.id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = betRouter;
/*
betRouter.patch('/:id', jsonBodyParser, async (req, res, next) => {
  const { current, last } = req.body;
  const patchBet = { current, last };

  for (const field of ['current', 'last'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });
});
*/
