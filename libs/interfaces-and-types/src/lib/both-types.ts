import { Seating, Game, DealCore } from './frontend-types';


export interface DealRelevant extends DealCore {
  _id: string,
}
export interface GameRelevant {
  deals: string[];
  players: string[];
  completionDate: number;
  room: RoomRelevant,
  _id: string,
}

export interface GetUserResponse {
  username: string,
  id: string,
}


export interface LocalStorageUserCore {
  [key: string]: string | number | GameRelevant[] | string[];
  lastSearchDate: number;
  username: string;
  lastGameCount: number;
  email: string;
}

export interface LocalStorageUser extends LocalStorageUserCore {
  gameIds: string[];
}

export interface LocalStorageUserWithGames extends LocalStorageUserCore {
  games: GameRelevant[];
}

export interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

export interface LocalStorageGames {
  [key: string]: GameRelevant[];
}
export interface RoomRelevant {
  name: string,
  seating: Seating,
}

export type EmptyLocalStorageDealsReturn = null;
export type EmptyLocalStorageUsersReturn = null;
export type EmptyLocalStorageGamesReturn = {[key:string]: Game[]};