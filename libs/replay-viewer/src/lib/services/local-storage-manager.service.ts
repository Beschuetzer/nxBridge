import { Injectable } from '@angular/core';
import { EmptyLocalStorageReturn, Game, LocalStorageUser, LocalStorageUsers, User } from '@nx-bridge/interfaces-and-types';

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

  createLocalStorageUser(userId: string, username: string, email: string, games: Game[], gameCount: number) {
    if (!userId) return null;
    let localStorageUsers = this.getLocalStorageUsers();
    const time = Date.now();

    const newLocalStorageUser: LocalStorageUser = {
      username,
      lastGameCount: gameCount,
      lastSearchDate: time,
      games, 
      email,
    }

    if (localStorageUsers) {
      localStorageUsers[userId] = newLocalStorageUser;
    } else {
      localStorageUsers = {
        [userId]: newLocalStorageUser,
      }
    }

    localStorage.setItem(this.usersInLocalStorage, JSON.stringify(localStorageUsers));
    return localStorageUsers;
  }
}
