import { Injectable } from '@angular/core';
import { Game } from '@nx-bridge/interfaces-and-types';

interface LocalStorageUser {
  games: Game[];
  id: string;
  email: string;
  lastSearchDate: number;
  lastGameCount: number;
}

interface LocalStorageUsers {
  [key: string]: LocalStorageUser;
}

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  private usersInLocalStorage = 'users';

  constructor() {}
  getLocalStorageUser(username: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if(localStorageUsers) {
      const localStorageUser = localStorageUsers[username];
      return localStorageUser;
    }

    return null;
  }

  getLocalStorageUsers(): LocalStorageUsers | '' {
    const itemInStorage = localStorage.getItem(this.usersInLocalStorage);
    
    if (!itemInStorage) return '';

    const parsed = itemInStorage
      ? (JSON.parse(itemInStorage) as LocalStorageUsers)
      : '';
    return parsed;
  }

  updateLocalStorageUsers(username: string, games: Game[], email: string, gameCount: number, id: string) {
    let localStorageUsers = this.getLocalStorageUser(username);


    const newLocalStorageUser: LocalStorageUser = {
      id,
      email,
      lastGameCount: gameCount,
      lastSearchDate: Date.now(),
      games, 
    }


    if (localStorageUsers) {
      return null;

    } else {
      localStorageUsers:  = {
        [username]: newLocalStorageUser,
      }
      localStorage.setItem(this.usersInLocalStorage, JSON.stringify(localStorageUsers));
    }

  }
}
