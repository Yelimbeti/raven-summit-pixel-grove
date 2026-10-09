create table if not exists rooms (
  code text primary key,
  title text not null,
  category text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists options (
  id serial primary key,
  room_code text not null references rooms(code),
  label text not null,
  created_at timestamptz not null default now()
);

create index if not exists options_room_idx on options (room_code);

create table if not exists votes (
  room_code text not null,
  option_id integer not null references options(id) on delete cascade,
  voter_key text not null,
  primary key (room_code, voter_key)
);

create index if not exists votes_option_idx on votes (option_id);
