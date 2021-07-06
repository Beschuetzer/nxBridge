import { Game} from '@nx-bridge/interfaces-and-types';

export interface LocalStorageUserCore {
  [key: string]: string | number | Game[];
}

export interface LocalStorageUser extends LocalStorageUserCore {
  games: Game[];
  lastSearchDate: number;
  username: string;
  lastGameCount: number;
}

export interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

export type EmptyLocalStorageReturn = null;