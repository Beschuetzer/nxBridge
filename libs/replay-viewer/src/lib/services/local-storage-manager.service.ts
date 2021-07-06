import { Injectable } from '@angular/core';
import { Game, Preferences } from '@nx-bridge/interfaces-and-types';

export interface LocalStorageUser {
  username: string;
  games: Game[];
  email: string;
  lastSearchDate: number;
  lastGameCount: number;
  preferences: Preferences,
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

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}
  getLocalStorageUser(id: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if(localStorageUsers) {
      const localStorageUser = localStorageUsers[id];
      return localStorageUser;
    }

    return null;
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
    return null;
  }

  getIdFromEmail(email: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    for (const userId in localStorageUsers) {
      if (Object.prototype.hasOwnProperty.call(localStorageUsers, userId)) {
        const userObj = localStorageUsers[userId];
        if (userObj.email === email) return userId;
      }
    }
    return null;
  }

  appendGamesToLocalStorageUser(id: string, games: Game[]) {
    const localStorageUser = this.getLocalStorageUser(id);
    localStorageUser?.games.push(...games);
    return localStorageUser;
  }

  updateLocalStorageUsers(id: string, username: string, games: Game[], email: string, gameCount: number, time: number, preferences: Preferences) {
    if (!username) return null;
    let localStorageUsers = this.getLocalStorageUsers();
    const newLocalStorageUser: LocalStorageUser = {
      username,
      email,
      lastGameCount: gameCount,
      lastSearchDate: time,
      games, 
      preferences,
    }

    if (localStorageUsers) {
      localStorageUsers[id] = newLocalStorageUser;
    } else {
      localStorageUsers = {
        [id]: newLocalStorageUser,
      }
    }

    localStorage.setItem(this.usersInLocalStorage, JSON.stringify(localStorageUsers));
    return localStorageUsers;
  }
}
