/* eslint-disable strict */
const express = require('express');
const { requireAuth } = require('../middleware/jwt-auth');
const path = require('path');
const handService = require('./hand-service');

const handRouter = express.Router();
const jsonBodyParser = express.json();

handRouter.use(requireAuth);

handRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { game_id, button } = req.body;
  const newHand = {
    //call to get newHand body
    game_id: game_id,
    button: button,
    player1_hand1: '2h',
    player1_hand2: '2c',
    player2_hand1: 'As',
    player2_hand2: 'Ks',
    player1_hand_rank: 400,
    player2_hand_rank: 1000,
    player1_hand_rank_type: 'HIGH CARD',
    player2_hand_rank_type: 'STRAIGHT FLUSH',
    flop1: 'Kc',
    flop2: '2s',
    flop3: 'Ah',
    turn: '9d',
    river: 'Kh'
  };

  for (const field of ['game_id', 'button'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  handService.newHand(req.app.get('db'), newHand).then(hand => {
    //console.log('hand is ', hand);
    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${hand.id}`))
      .json(hand);
  });
});

handRouter.get('/:id', (req, res, next) => {
  handService
    .getHandById(req.app.get('db'), req.params.id)
    .then(hand => {
      res.json(hand);
    })
    .catch(next);
});

module.exports = handRouter;
