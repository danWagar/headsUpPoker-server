const betService = {
  hasBetWithHandId(db, id) {
    return db('bet')
      .where({ id })
      .first()
      .then(user => !!user);
  }
};
