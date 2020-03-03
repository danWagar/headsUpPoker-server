/* eslint-disable strict */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Bet Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  // @input: player1: user(id), player2: user(id), stack_size: integer
  // @output: game(id)

  describe('POST api/bet', () => {
    context('bad new game request', () => {
      const player1 = testUsers[0];
      const player2 = testUsers[1];
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      beforeEach('insert game', () => helpers.seedGame(db, player1, player2));

      const requiredFields = ['hand_id', 'bet_type', 'current_player', 'current_amt', 'last_amt'];

      requiredFields.forEach(field => {
        const newBetAttemptBody = {
          hand_id: 123,
          bet_type: 'post',
          current_player: player1.id,
          current_amt: 1,
          last_amt: 2
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete newBetAttemptBody[field];

          return supertest(app)
            .post('/api/bet')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newBetAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });

    context(`happy path for bet endpoint`, () => {
      const player1 = testUsers[0];
      const player2 = testUsers[1];
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      beforeEach('insert game', () => helpers.seedGame(db, player1, player2));
      beforeEach('insert hand', () => helpers.seedHand(db));

      const newBetBody = {
        hand_id: 1,
        bet_type: 'post',
        current_player: player1.id,
        current_amt: 1,
        last_amt: 2
      };

      it.only('creates a new bet and responds with bet id', () => {
        return supertest(app)
          .post('/api/bet')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newBetBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
          })
          .expect(res =>
            db
              .from('bet')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.current_player).to.eql(newBetBody.current_player);
                expect(row.current_amt).to.eql(newBetBody.current_amt);
                expect(row.last_amt).to.eql(newBetBody.last_amt);
                expect(row.bet_type).to.eql(newBetBody.bet_type);
              })
          );
      });
    });
  });
});
