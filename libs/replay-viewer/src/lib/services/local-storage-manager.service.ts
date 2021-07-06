import { Injectable } from '@angular/core';
import { Game, Preferences, User } from '@nx-bridge/interfaces-and-types';

export interface LocalStorageUser {
  username: string;
  games: Game[];
  lastSearchDate: number;
  lastGameCount: number;
  preferences: Preferences | null,
}

export interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

export type EmptyLocalStorageReturn = null;

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  public usersInLocalStorage = 'users';
  public EMPTY_LOCAL_STORAGE_RETURNS = null;
  public EMPTY_USER_ID_RETURNS = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  getLocalStorageUser(id: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if(localStorageUsers) {
      const localStorageUser = localStorageUsers[id];
      return localStorageUser;
    }

    return this.EMPTY_LOCAL_STORAGE_RETURNS;
  }

  getLocalStorageUsers(): LocalStorageUsers | EmptyLocalStorageReturn {
    const itemInStorage = localStorage.getItem(this.usersInLocalStorage);
    
    if (!itemInStorage) return this.EMPTY_LOCAL_STORAGE_RETURNS;

    const parsed = itemInStorage
      ? (JSON.parse(itemInStorage) as LocalStorageUsers)
      : this.EMPTY_LOCAL_STORAGE_RETURNS;
    return parsed;
  }

  getLastGameCount(id: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    if (!localStorageUsers || !localStorageUsers[id]) return 0;

    return localStorageUsers[id].lastGameCount;
  }

  getIdFromUsername(username: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    for (const userId in localStorageUsers) {
      if (Object.prototype.hasOwnProperty.call(localStorageUsers, userId)) {
        const userObj = localStorageUsers[userId];
        if (userObj.username === username) return userId;
      }
    }
    return this.EMPTY_USER_ID_RETURNS;
  }

  appendGamesToLocalStorageUser(id: string, games: Game[]) {
    const localStorageUser = this.getLocalStorageUser(id);
    localStorageUser?.games.push(...games);
    return localStorageUser;
  }

  appendLocalStorageUser(userObj: User, games: Game[], gameCount: number) {
    if (!userObj) return null;
    let localStorageUsers = this.getLocalStorageUsers();
    const time = Date.now();

    const newLocalStorageUser: LocalStorageUser = {
      username: userObj.username,
      lastGameCount: gameCount,
      lastSearchDate: time,
      games, 
      preferences: userObj.preferences,
    }

    if (localStorageUsers) {
      localStorageUsers[(userObj as any)._id] = newLocalStorageUser;
    } else {
      localStorageUsers = {
        [(userObj as any)._id]: newLocalStorageUser,
      }
    }

    localStorage.setItem(this.usersInLocalStorage, JSON.stringify(localStorageUsers));
    return localStorageUsers;
  }
}
