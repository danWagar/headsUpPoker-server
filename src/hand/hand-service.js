const handService = {
  newHand(db, newHand) {
    console.log(newHand);
    return db
      .insert(newHand)
      .into('hand')
      .returning('*')
      .then(([hand]) => {
        return hand;
      });
  }
};

module.exports = handService;
