/* eslint-disable strict */
const xss = require('xss');

const gameService = {
  newGame(db, newGame) {
    console.log('posting newGame ', newGame);
    return db
      .insert(newGame)
      .into('game')
      .returning('*')
      .then(([game]) => {
        console.log('game is ' + game);
        return game;
      });
  }
};

module.exports = gameService;
