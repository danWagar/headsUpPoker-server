/* eslint-disable strict */
const express = require('express');
const path = require('path');
const gameService = require('./game-service');

const gameRouter = express.Router();
const jsonBodyParser = express.json();

gameRouter.post('/', jsonBodyParser, (req, res, next) => {
  const { player1_id, player2_id, player1_stack, player2_stack } = req.body;
  const newGame = { player1_id, player2_id, player1_stack, player2_stack };

  for (const field of ['player1_id', 'player2_id', 'player1_stack', 'player2_stack'])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  gameService.newGame(req.app.get('db'), newGame).then(game => {
    console.log('game is ', game);
    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${game.id}`))
      .json(game);
  });
});

module.exports = gameRouter;
