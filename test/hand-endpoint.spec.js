/* eslint-disable strict */
const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Hand Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();
  const player1 = testUsers[0];
  const player2 = testUsers[1];

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
  
  beforeEach('insert users', () => helpers.seedUsers(db, testUsers));
  
  beforeEach('insert game', () => helpers.seedGame(db, player1, player2));

  // @input: player1: user(id), player2: user(id), stack_size: integer
  // @output: game(id)

  describe('POST api/hand', () => {
    context('bad new hand request', () => {

      const requiredFields = ['game_id', 'button'];

      requiredFields.forEach(field => {
        const newHandAttemptBody = {
          game_id: 1,
          button: player1.id
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete newHandAttemptBody[field];

          return supertest(app)
            .post('/api/hand')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newHandAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });

    context(`happy path for hand endpoint`, () => {
      const player1 = testUsers[0];
      const player2 = testUsers[1];

      const newHandBody = {
        game_id: 1,
        button: player1.id
      };

      const handExpectedResults = {
        game_id: 1,
        button: player1.id,
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

      it.only('creates a new bet and responds with hand id', () => {
        return supertest(app)
          .post('/api/hand')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newHandBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
          })
          .expect(res =>
            db
              .from('hand')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.game_id).to.eql(handExpectedResults.game_id);
                expect(row.button).to.eql(handExpectedResults.button);
                expect(row.player1_hand1).to.eql(handExpectedResults.player1_hand1);
                expect(row.player1_hand2).to.eql(handExpectedResults.player1_hand2);
                expect(row.player2_hand1).to.eql(handExpectedResults.player2_hand1);
                expect(row.player2_hand2).to.eql(handExpectedResults.player2_hand2);
                expect(row.player1_hand_rank).to.eql(handExpectedResults.player1_hand_rank);
                expect(row.player2_hand_rank).to.eql(handExpectedResults.player2_hand_rank);
                expect(row.player1_hand_rank_type).to.eql(handExpectedResults.player1_hand_rank_type);
                expect(row.player2_hand_rank_type).to.eql(handExpectedResults.player2_hand_rank_type);
                expect(row.flop1).to.eql(handExpectedResults.flop1);
                expect(row.flop2).to.eql(handExpectedResults.flop2);
                expect(row.flop3).to.eql(handExpectedResults.flop3);
                expect(row.turn).to.eql(handExpectedResults.turn);
                expect(row.river).to.eql(handExpectedResults.river);
              })
          );
      });
    });
  });

  describe('GET /api/hand/:id', (req, res, next) => {
    const game_id = 1;
    const button = player1.id,
    const hand = helpers.handFixture(game_id, button);
    
    beforeEach('insert hand', () => helpers.seedHand(db, hand));
    it('returns correct hand given id', () => {
      return supertest(app).get('/api/hand/1')
      .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
      .expect(200, hand);
    })

  })
});
