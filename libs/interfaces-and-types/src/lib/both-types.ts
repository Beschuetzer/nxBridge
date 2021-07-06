import { Game} from '@nx-bridge/interfaces-and-types';

export interface GetUserResponse {
  username: string,
  id: string,
}

export interface LocalStorageUserCore {
  [key: string]: string | number | Game[];
}

export interface LocalStorageUser extends LocalStorageUserCore {
  games: Game[];
  lastSearchDate: number;
  username: string;
  lastGameCount: number;
  email: string;
}

export interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

export type EmptyLocalStorageReturn = null;