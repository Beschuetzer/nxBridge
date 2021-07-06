import { Injectable } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';

export interface LocalStorageUser {
  games: Game[];
  id: string;
  email: string;
  lastSearchDate: number;
  lastGameCount: number;
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

  constructor() {}
  getLocalStorageUser(username: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if(localStorageUsers) {
      const localStorageUser = localStorageUsers[username];
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

  updateLocalStorageUsers(username: string, games: Game[], email: string, gameCount: number, id: string, time: number) {
    if (!username) return null;
    let localStorageUsers = this.getLocalStorageUsers();
    const newLocalStorageUser: LocalStorageUser = {
      id,
      email,
      lastGameCount: gameCount,
      lastSearchDate: time,
      games, 
    }

    if (localStorageUsers) {
      localStorageUsers[username] = newLocalStorageUser;
    } else {
      localStorageUsers = {
        [username]: newLocalStorageUser,
      }
    }

    localStorage.setItem(this.usersInLocalStorage, JSON.stringify(localStorageUsers));
    return localStorageUsers;
  }
}
