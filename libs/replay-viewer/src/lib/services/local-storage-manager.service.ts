import { Injectable } from '@angular/core';
import {
  EmptyLocalStorageGamesReturn,
  EmptyLocalStorageUsersReturn,
  Game,
  GameDetailDisplayPreferences,
  LocalStorageGames,
  LocalStorageUser,
  LocalStorageUsers,
  LocalStorageUserWithGames,
} from '@nx-bridge/interfaces-and-types';
import { sortDescending } from '@nx-bridge/constants';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  public usersInLocalStorage = 'users';
  public gamesInLocalStorage = 'games';
  public sortPreferenceInLocalStorage = 'sort';
  public sizePreferenceInLocalStorage = 'size';
  public EMPTY_LOCAL_STORAGE_USERS_RETURNS = null;
  public EMPTY_LOCAL_STORAGE_GAMES_RETURNS = {};
  public EMPTY_USER_ID_RETURNS = '';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  appendGamesToLocalStorageUser(userId: string, games: Game[]) {
    const localStorageUser = this.getLocalStorageUser(userId);

    if (!localStorageUser) return false;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!game) continue;
      const index = localStorageUser.gameIds.findIndex(
        (gameLocal) => {
          return (gameLocal && gameLocal === (game as any)?._id)
        }
      );

      if (index === -1) {
        localStorageUser.gameIds.push((game as any)?._id);
      }
    }

    localStorageUser.lastGameCount = localStorageUser.gameIds.length;
    localStorageUser.lastSearchDate = Date.now();
    this.saveLocalStorageUser(userId, localStorageUser);
    this.saveGameIds(games);
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

    this.saveGameIds(games);
    return localStorageUsers;
  }

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

  getLastGameCount(userId: string) {
    const localStorageUsers = this.getLocalStorageUsers();
    if (!localStorageUsers || !localStorageUsers[userId]) return 0;

    return localStorageUsers[userId].lastGameCount;
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

  getLocalStorageUsers(): LocalStorageUsers | EmptyLocalStorageUsersReturn {
    const itemInStorage = localStorage.getItem(this.usersInLocalStorage);

    if (!itemInStorage) return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;

    return (JSON.parse(itemInStorage) as LocalStorageUsers);
  }

  getLocalStorageUserWithGames(userId: string): LocalStorageUserWithGames | EmptyLocalStorageUsersReturn {
    const localStorageUser = this.getLocalStorageUser(userId) as any;
    if (!localStorageUser) return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;

    const games: Game[] = [];
    
    for (let i = 0; i < localStorageUser.gameIds.length; i++) {
      const gameId = localStorageUser.gameIds[i];
      const game = this.getGameFromGameId(gameId) as Game;
      if (game) {
        if (games.length === 0 || game.completionDate < games[games.length - 1].completionDate) games.push(game);
        else {
          const indexToUse = this.getIndexToAddGameIntoGames(games, game);
          games.splice(indexToUse, 0, game);
        }
      }
    }

    localStorageUser.games = games;
    delete localStorageUser.gameIds;
    return localStorageUser;
  }

  getPreferences(): GameDetailDisplayPreferences {
    const sortLocalStorageValue = localStorage.getItem(this.sortPreferenceInLocalStorage);
    const sizeLocalStorageValue = localStorage.getItem(this.sizePreferenceInLocalStorage);
    const sort = sortLocalStorageValue ? sortLocalStorageValue : '';
    const size = sizeLocalStorageValue ? sizeLocalStorageValue : '';

    return {
      sort,
      size,
    }
  }

  saveSizePreference(sizePreference: string) {
    localStorage.setItem(this.sizePreferenceInLocalStorage, sizePreference);
  }

  saveSortPreference(sortPreference: string) {
    localStorage.setItem(this.sortPreferenceInLocalStorage, sortPreference);
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
    const localStorageGames = this.getLocalStorageGames();
    const toReturn = localStorageGames[gameId] as any;
    return toReturn;
  }

  private getIndexToAddGameIntoGames (games: Game[], game: Game) {
    //assumes games is in descending order already
    //find index at which game.completionDate >= games[index].completionDate and <= game[index + 1].completionDate then return that index + 1;
    const maxNumberOfGamesToDoLinearly = 100;
    const shouldDoLinearly = games.length < maxNumberOfGamesToDoLinearly;
    let indexWhereConditionMet = -1;

    //note: the point of the loop if to find where the condition is met and assign j to indexWhereConditionMet
    debugger;
    if (shouldDoLinearly) {
      for (let j = 0; j < games.length; j++) {
        if (j === games.length - 1) indexWhereConditionMet = j;

        const gameToCheck = games[j];
        const gameToCheckNext = games[j + 1];

        //todo: what about the scenario where game.completionDate is greater than all of the items in games?
        if (game.completionDate >= gameToCheck.completionDate) indexWhereConditionMet = j;
        else if (game.completionDate < gameToCheck.completionDate && game.completionDate <= gameToCheckNext.completionDate) indexWhereConditionMet = j;

        if (indexWhereConditionMet !== -1) break;
      }
    } else {
      const indexToStartAt = Math.floor(games.length / 2);

      //todo: implement a binary search pproach
    }

    return indexWhereConditionMet + 1;
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
