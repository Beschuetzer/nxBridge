import { Injectable } from '@angular/core';
import {
  EmptyLocalStorageGamesReturn,
  EmptyLocalStorageUsersReturn,
  Game,
  LocalStorageGames,
  LocalStorageUser,
  LocalStorageUsers,
  User,
} from '@nx-bridge/interfaces-and-types';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  public usersInLocalStorage = 'users';
  public gamesInLocalStorage = 'games';
  public EMPTY_LOCAL_STORAGE_USERS_RETURNS = null;
  public EMPTY_LOCAL_STORAGE_GAMES_RETURNS = [];
  public EMPTY_USER_ID_RETURNS = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getGames(userId: string) {
    const localStorageUser = this.getLocalStorageUser(userId);
    return localStorageUser?.games;
  }

  getLocalStorageGames(): LocalStorageGames | EmptyLocalStorageGamesReturn {
    const itemInStorage = localStorage.getItem(this.gamesInLocalStorage);

    if (!itemInStorage) return this.EMPTY_LOCAL_STORAGE_GAMES_RETURNS;

    return JSON.parse(itemInStorage) as LocalStorageGames
  }

  getLocalStorageUser(userId: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if (localStorageUsers) {
      const localStorageUser = localStorageUsers[userId];
      return localStorageUser;
    }

    return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;
  }

  getLocalStorageUsers(): LocalStorageUsers | EmptyLocalStorageUsersReturn {
    const itemInStorage = localStorage.getItem(this.usersInLocalStorage);

    if (!itemInStorage) return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;

    return (JSON.parse(itemInStorage) as LocalStorageUsers);
  }

  getLastGameCount(userId: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    if (!localStorageUsers || !localStorageUsers[userId]) return 0;

    return localStorageUsers[userId].lastGameCount;
  }

  getIdFromUsername(username: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    for (const userId in localStorageUsers) {
      if (Object.prototype.hasOwnProperty.call(localStorageUsers, userId)) {
        const userObj = localStorageUsers[userId];
        if (userObj.username && userObj.username === username) return userId;
      }
    }
    return this.EMPTY_USER_ID_RETURNS;
  }

  getIdFromEmail(email: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    for (const userId in localStorageUsers) {
      if (Object.prototype.hasOwnProperty.call(localStorageUsers, userId)) {
        const userObj = localStorageUsers[userId];
        if (userObj.email && userObj.email === email) return userId;
      }
    }
    return this.EMPTY_USER_ID_RETURNS;
  }

  appendGamesToLocalStorageUser(userId: string, games: Game[]) {
    const localStorageUser = this.getLocalStorageUser(userId);

    if (!localStorageUser) return false;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const index = localStorageUser.games.findIndex(
        (gameLocal) => {
          return ((gameLocal as any)._id && (gameLocal as any)._id === (game as any)._id)
        }
      );

      if (index === -1) {
        localStorageUser.games.push(game);
      }
    }

    localStorageUser.lastGameCount = localStorageUser.games.length;
    localStorageUser.lastSearchDate = Date.now();
    this.saveLocalStorageUser(userId, localStorageUser);
    return localStorageUser;
  }

  createLocalStorageUser(
    userId: string,
    username: string,
    email: string,
    games: Game[],
    gameCount: number
  ) {
    if (!userId) return null;
    let localStorageUsers = this.getLocalStorageUsers();
    const time = Date.now();

    const newLocalStorageUser: LocalStorageUser = {
      username,
      lastGameCount: gameCount,
      lastSearchDate: time,
      games,
      email,
    };

    if (localStorageUsers) {
      localStorageUsers[userId] = newLocalStorageUser;
    } else {
      localStorageUsers = {
        [userId]: newLocalStorageUser,
      };
    }

    this.saveLocalStorageUsers(localStorageUsers);
    return localStorageUsers;
  }

  updateEmailAndUsername(userId: string, username: string, email: string) {
    if (!userId) return;
    const localStorageUser = this.getLocalStorageUser(userId);
    if (!localStorageUser) return;

    const trimmedUsername = username ? username.trim() : '';
    const trimmedEmail = email ? email.trim() : '';

    if (trimmedUsername) localStorageUser.username = trimmedUsername;
    if (trimmedEmail) localStorageUser.email = trimmedEmail;

    this.saveLocalStorageUser(userId, localStorageUser);
  }

  private saveGameIds(games: Game[]) {
    const localStorageGames = this.getLocalStorageGames() as Game[];

    debugger;
    for (let i = 0; i < localStorageGames.length; i++) {
      const localStorageGame = localStorageGames[i];
      
    }
  }

  private saveLocalStorageUser(
    userId: string,
    localStorageUser: LocalStorageUser
  ) {
    let localStorageUsers = this.getLocalStorageUsers();
    if (!localStorageUsers) {
      localStorageUsers = {
        [userId]: localStorageUser,
      };
    } else {
      localStorageUsers[userId] = localStorageUser;
    }

    this.saveLocalStorageUsers(localStorageUsers);
  }

  private saveLocalStorageUsers(localStorageUsers: LocalStorageUsers) {
    localStorage.setItem(
      this.usersInLocalStorage,
      JSON.stringify(localStorageUsers)
    );
  }
}
