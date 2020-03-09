
CREATE TYPE card AS ENUM (
		'BAD', '2c', '2d', '2h', '2s',
		'3c', '3d', '3h', '3s',
		'4c', '4d', '4h', '4s',
		'5c', '5d', '5h', '5s',
		'6c', '6d', '6h', '6s',
		'7c', '7d', '7h', '7s',
		'8c', '8d', '8h', '8s',
		'9c', '9d', '9h', '9s',
		'Tc', 'Td', 'Th', 'Ts',
		'Jc', 'Jd', 'Jh', 'Js',
		'Qc', 'Qd', 'Qh', 'Qs',
		'Kc', 'Kd', 'Kh', 'Ks',
		'Ac', 'Ad', 'Ah', 'As'
);

CREATE TYPE hand_rank_type AS ENUM (
	'INVALID HAND',
	'HIGH CARD',
	'PAIR',
	'TWO PAIR',
	'SET',
	'STRAIGHT',
	'FLUSH',
	'FULLHOUSE',
	'QUADS',
	'STRAIGHT FLUSH'
);

CREATE TYPE bet_type AS ENUM (
  'post',
  'check',
  'call',
  'raise',
  'fold'
);

CREATE TABLE game (
  id SERIAL PRIMARY KEY,
  player1_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player2_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player1_stack INTEGER NOT NULL,
  player2_stack INTEGER NOT NULL,
  blind_level INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE hand (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES game(id) ON DELETE CASCADE NOT NULL,
  button INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  player1_hand1 card NOT NULL,
  player1_hand2 card NOT NULL,
  player2_hand1 card NOT NULL,
  player2_hand2 card NOT NULL,
  player1_hand_rank INTEGER NOT NULL, 
  player2_hand_rank INTEGER NOT NULL, 
  player1_hand_rank_type hand_rank_type NOT NULL,
  player2_hand_rank_type hand_rank_type NOT NULL, 
  flop1 card NOT NULL,
  flop2 card NOT NULL,
  flop3 card NOT NULL,
  turn card NOT NULL,
  river card NOT NULL
);

CREATE TABLE bet (
  id SERIAL PRIMARY KEY,
  hand_id INTEGER REFERENCES hand(id) ON DELETE CASCADE NOT NULL,
  current_player INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  bet_type bet_type NOT NULL,
  current_amt INTEGER NOT NULL,
  last_amt INTEGER NOT NULL
);