/* eslint-disable strict */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Hand Endpoints', function() {
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

  describe('POST api/hand', () => {
    context('bad new hand request', () => {
      const player1 = testUsers[0];
      const player2 = testUsers[1];
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      beforeEach('insert game', () => helpers.seedGame(db, player1, player2));

      const requiredFields = [
        'game_id',
        'button',
        'player1_hand1',
        'player2_hand2',
        'player2_hand1',
        'player2_hand2',
        'player1_hand_rank',
        'player2_hand_rank',
        'player1_hand_rank_type',
        'player2_hand_rank_type',
        'flop1',
        'flop2',
        'flop3',
        'turn',
        'river'
      ];

      requiredFields.forEach(field => {
        const newHandAttemptBody = {
          game_id: 1,
          button: player1.id,
          player1_hand1: 3,
          player1_hand2: 4,
          player2_hand1: 32,
          player2_hand2: 33,
          player1_hand_rank: 400,
          player2_hand_rank: 1000,
          player1_hand_rank_type: 'HIGH CARD',
          player2_hand_rank_type: 'STRAIGHT FLUSH',
          flop1: 12,
          flop2: 13,
          flop3: 14,
          turn: 15,
          river: 16
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

    context(`happy path for hand endpoint`, () => {
      const player1 = testUsers[0];
      const player2 = testUsers[1];
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
      beforeEach('insert game', () => helpers.seedGame(db, player1, player2));
      beforeEach('insert hand', () => helpers.seedHand(db));

      const newHandBody = {
        game_id: 1,
        button: player1.id,
        player1_hand1: 3,
        player1_hand2: 4,
        player2_hand1: 32,
        player2_hand2: 33,
        player1_hand_rank: 400,
        player2_hand_rank: 1000,
        player1_hand_rank_type: 'HIGH CARD',
        player2_hand_rank_type: 'STRAIGHT FLUSH',
        flop1: 12,
        flop2: 13,
        flop3: 14,
        turn: 15,
        river: 16
      };

      it('creates a new bet and responds with hand id', () => {
        return supertest(app)
          .post('/api/bet')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newHandBody)
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
                expect(row.game_id).to.eql(newHandBody.game_id);
                expect(row.button).to.eql(newHandBody.button);
                expect(row.player1_hand1).to.eql(newHandBody.player1_hand1);
                expect(row.player1_hand2).to.eql(newHandBody.player1_hand2);
                expect(row.player2_hand1).to.eql(newHandBody.player2_hand1);
                expect(row.player2_hand2).to.eql(newHandBody.player2_hand2);
                expect(row.player1_hand_rank).to.eql(newHandBody.player1_hand_rank);
                expect(row.player2_hand_rank).to.eql(newHandBody.player2_hand_rank);
                expect(row.player1_hand_rank_type).to.eql(newHandBody.player1_hand_rank_type);
                expect(row.player2_hand_rank_type).to.eql(newHandBody.player2_hand_rank_type);
                expect(row.flop1).to.eql(newHandBody.flop1);
                expect(row.flop2).to.eql(newHandBody.flop2);
                expect(row.flop3).to.eql(newHandBody.flop3);
                expect(row.turn).to.eql(newHandBody.turn);
                expect(row.river).to.eql(newHandBody.river);
              })
          );
      });
    });
  });
});
