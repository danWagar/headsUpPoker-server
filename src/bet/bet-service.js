/* eslint-disable strict */

const betService = {
  hasBetWithHandId(db, id) {
    return db('bet')
      .where({ id })
      .first()
      .then(user => !!user);
  },

  newBet(db, newBet) {
    console.log(newBet);
    return db
      .insert(newBet)
      .into('bet')
      .returning('*')
      .then(([bet]) => bet)
      .then(bet => bet);
  }
};

module.exports = betService;
