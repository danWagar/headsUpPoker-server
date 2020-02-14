/* eslint-disable strict */
const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Game Endpoints', function() {
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

  describe('POST api/game', () => {
    context(`bad new game request`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

      const requiredFields = ['player1_id', 'player2_id', 'player1_stack', 'player2_stack'];

      requiredFields.forEach(field => {
        const newGameAttemptBody = {
          player1_id: 123,
          player2_id: 456,
          player1_stack: 2000,
          player2_stack: 2000
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete newGameAttemptBody[field];

          return supertest(app)
            .post('/api/game')
            .send(newGameAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });
      });
    });

    context(`happy path for game endpoint`, () => {
      beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

      const player1 = testUsers[0];
      const player2 = testUsers[1];
      const stack_size = 2000;

      const newGameBody = {
        player1_id: player1.id,
        player2_id: player2.id,
        player1_stack: stack_size,
        player2_stack: stack_size
      };

      it('creates a new game and responds with game id', () => {
        return supertest(app)
          .post('/api/game')
          .send(newGameBody)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
            const actualDate = new Date(res.body.start_time).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          })
          .expect(res =>
            db
              .from('game')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.player1_id).to.eql(newGameBody.player1_id);
                expect(row.player2_id).to.eql(newGameBody.player2_id);
                expect(row.player1_stack).to.eql(newGameBody.player1_stack);
                expect(row.player2_stack).to.eql(newGameBody.player2_stack);
                const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' });
                const actualDate = new Date(row.start_time).toLocaleString();
                expect(actualDate).to.eql(expectedDate);
              })
          );
      });
    });
  });
});
