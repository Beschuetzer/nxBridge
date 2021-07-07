import { Injectable } from '@angular/core';
import {
  EmptyLocalStorageGamesReturn,
  EmptyLocalStorageUsersReturn,
  Game,
  LocalStorageGames,
  LocalStorageUser,
  LocalStorageUsers,
  LocalStorageUserWithGames,
  User,
} from '@nx-bridge/interfaces-and-types';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  public usersInLocalStorage = 'users';
  public gamesInLocalStorage = 'games';
  public EMPTY_LOCAL_STORAGE_USERS_RETURNS = null;
  public EMPTY_LOCAL_STORAGE_GAMES_RETURNS = {};
  public EMPTY_USER_ID_RETURNS = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  getGames(userId: string) {
    const localStorageGames = this.getLocalStorageGames();
    const localStorageUser = this.getLocalStorageUser(userId);
    if (!localStorageUser) return [];

    const games: Game[] = [];

    for (let i = 0; i < localStorageUser?.gameIds?.length; i++) {
      const localGameId = localStorageUser?.gameIds[i];
      games.push(localStorageGames[localGameId] as any)
    }

    return games;
  }

  getLocalStorageGames(): LocalStorageGames | EmptyLocalStorageGamesReturn {
    const itemInStorage = localStorage.getItem(this.gamesInLocalStorage);

    if (!itemInStorage) return this.EMPTY_LOCAL_STORAGE_GAMES_RETURNS;

    return JSON.parse(itemInStorage) as LocalStorageGames;
  }

  getLocalStorageUser(userId: string): LocalStorageUser | null {
    const localStorageUsers = this.getLocalStorageUsers();

    if (localStorageUsers) {
      const localStorageUser = localStorageUsers[userId];
      return localStorageUser;
    }

    return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;
  }

  getLocalStorageUserWithGames(userId: string): LocalStorageUserWithGames | EmptyLocalStorageUsersReturn {
    const localStorageUser = this.getLocalStorageUser(userId) as any;
    if (!localStorageUser) return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;

    const games: Game[] = [];
    
    for (let i = 0; i < localStorageUser.games.length; i++) {
      const gameId = localStorageUser.games[i];
      games.push(this.getGameFromGameId(gameId as string))
    }

    localStorageUser.games = games;
    return localStorageUser;
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
      const index = localStorageUser.gameIds.findIndex(
        (gameLocal) => {
          return ((gameLocal as any)._id && (gameLocal as any)._id === (game as any)._id)
        }
      );

      if (index === -1) {
        // localStorageUser.games.push(game);
      }
    }

    localStorageUser.lastGameCount = localStorageUser.gameIds.length;
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
      gameIds: this.getGameIds(games),
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

    debugger;

    this.saveGameIds(games);
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

  private getGameIds(games: Game[]) {
    return games.map(game => (game as any)._id);
  }

  private getGameFromGameId(gameId: string) {
    debugger;

    const localStorageGames = this.getLocalStorageGames();
    const toReturn = localStorageGames[gameId] as any;
    return toReturn;
  }

  private saveGameIds(games: Game[]) {
    const localStorageGames = this.getLocalStorageGames() as any;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      let shouldAdd = true;
      for (const gameId in localStorageGames) {
        if (Object.prototype.hasOwnProperty.call(localStorageGames, gameId)) {
          if (gameId && gameId === (game as any)._id) {
            shouldAdd = false;
            break;
          }
        }
      }

      if (shouldAdd) localStorageGames[(game as any)._id as any] = game;
    }
    this.saveLocalStorageGames(localStorageGames);
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

  private saveLocalStorageGames(localStorageGames: LocalStorageGames) {
    localStorage.setItem(
      this.gamesInLocalStorage,
      JSON.stringify(localStorageGames)
    );
  }
}
