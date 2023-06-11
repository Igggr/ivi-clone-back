export type FilmSort = 'marks' | 'ratings' | 'date' | 'alphabet';

export type Rating =
  | `${1 | 2 | 3 | 4}.${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`
  | '5.0';
