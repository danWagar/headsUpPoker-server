const handService = {
  newHand(db, newHand) {
    return db
      .insert(newHand)
      .into('hand')
      .returning('*')
      .then(([hand]) => {
        return hand;
      });
  },

  getHandById(db, id) {
    console.log(id);
    return db
      .select('*')
      .from('hand')
      .where('id', id)
      .first();
  }
};

module.exports = handService;
