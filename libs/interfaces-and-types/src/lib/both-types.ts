import { Game} from '@nx-bridge/interfaces-and-types';

export interface GetUserResponse {
  username: string,
  id: string,
}

export interface LocalStorageUserCore {
  [key: string]: string | number | Game[] | string[];
  lastSearchDate: number;
  username: string;
  lastGameCount: number;
  email: string;
}

export interface LocalStorageUser extends LocalStorageUserCore {
  gameIds: string[];
}

export interface LocalStorageUserWithGames extends LocalStorageUserCore {
  games: Game[];
}

export interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

export interface LocalStorageGames {
  [key: string]: Game[];
}

export type EmptyLocalStorageUsersReturn = null;
export type EmptyLocalStorageGamesReturn = {[key:string]: Game[]};