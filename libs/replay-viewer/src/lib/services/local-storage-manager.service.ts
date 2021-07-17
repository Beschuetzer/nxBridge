import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  RESULTS_PER_PAGE_OPTIONS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
} from '@nx-bridge/constants';
import { HelpersService } from '@nx-bridge/helpers';
import {
  EmptyLocalStorageDealsReturn,
  EmptyLocalStorageGamesReturn,
  EmptyLocalStorageUsersReturn,
  FetchedDeals,
  GameDetailDisplayPreferences,
  GameRelevant,
  LocalStorageGames,
  LocalStorageUser,
  LocalStorageUsers,
  LocalStorageUserWithGames,
  UserIds,
} from '@nx-bridge/interfaces-and-types';
import { AppState, SetUserIds } from '@nx-bridge/store';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageManagerService {
  public usersInLocalStorage = 'users';
  public gamesInLocalStorage = 'games';
  public dealsInLocalStorage = 'deals';
  public sortPreferenceInLocalStorage = 'sort';
  public sizePreferenceInLocalStorage = 'size';
  public resultsPerPagePreferenceInLocalStorage = 'resultsPerPage';
  public userIdsInLocalStorage = 'userIds';
  public EMPTY_LOCAL_STORAGE_USERS_RETURNS = null;
  public EMPTY_LOCAL_STORAGE_GAMES_RETURNS = {};
  public EMPTY_USER_ID_RETURNS = '';

  private checkForIdsInterval: any;
  private checkForIdsIntervalDuration = 1000;
  private maxTimesToCheckForIds = 10;
  private isFinishedSavingUserIds = false;
  private userIdsMaxLife = 259200000; //3 days ( 1000 * 3600 * 72 );

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private helpersService: HelpersService,
    private store: Store<AppState>
  ) {}

  appendGamesToLocalStorageUser(userId: string, games: GameRelevant[]) {
    const localStorageUser = this.getLocalStorageUser(userId);

    if (!localStorageUser) return false;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!game) continue;
      const index = localStorageUser.gameIds.findIndex((gameLocal) => {
        return gameLocal && gameLocal === (game as any)?._id;
      });

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
    games: GameRelevant[],
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

  getFreeSpace() {
    let _lsTotal = 0;
    let _xLen;
    let _x;
    for (_x in localStorage) {
        // eslint-disable-next-line no-prototype-builtins
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    const total = (_lsTotal / 1024).toFixed(2);
    console.log("Total = " + total + " KB");
    return +total;
  }

  getGames(userId: string) {
    const localStorageGames = this.getLocalStorageGames();
    const localStorageUser = this.getLocalStorageUser(userId);
    if (!localStorageUser) return [];

    const games: GameRelevant[] = [];

    for (let i = 0; i < localStorageUser?.gameIds?.length; i++) {
      const localGameId = localStorageUser?.gameIds[i];
      games.push(localStorageGames[localGameId] as any);
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

  getLocalStorageDeals(): FetchedDeals | EmptyLocalStorageDealsReturn
  {
    const localStorageDeals = localStorage.getItem(this.dealsInLocalStorage);
    if (localStorageDeals) return JSON.parse(localStorageDeals);
    return null;
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

    return JSON.parse(itemInStorage) as LocalStorageUsers;
  }

  getPopulatedLocalStorageUser(
    userId: string
  ): LocalStorageUserWithGames | EmptyLocalStorageUsersReturn {
    const localStorageUser = this.getLocalStorageUser(userId) as any;
    if (!localStorageUser) return this.EMPTY_LOCAL_STORAGE_USERS_RETURNS;

    const games: GameRelevant[] = [];
    const userIdsInGames: string[] = [];

    for (let i = 0; i < localStorageUser.gameIds.length; i++) {
      const gameId = localStorageUser.gameIds[i];
      const game = this.getGameFromGameId(gameId) as GameRelevant;
      if (game) {
        if (
          games.length === 0 ||
          game.completionDate < games[games.length - 1].completionDate
        )
          games.push(game);
        else {
          const indexToUse = this.getIndexToAddGameIntoGames(games, game);
          games.splice(indexToUse, 0, game);
        }

        for (let j = 0; j < game.players.length; j++) {
          const playerId = game.players[j];
          if (!userIdsInGames.includes(playerId)) userIdsInGames.push(playerId);
        }
      }
    }

    localStorageUser.games = games;
    localStorageUser.userIds = userIdsInGames;
    delete localStorageUser.gameIds;
    return localStorageUser;
  }

  getPreferences(): GameDetailDisplayPreferences {
    const sort = this.getSortPreference();
    const size = this.getSizePreference();
    const resultsPerPage = this.getResultsPerPagePreference();

    return {
      sort,
      size,
      resultsPerPage,
    };
  }

  getResultsPerPagePreference() {
    const resultsLocalStorageValue = localStorage.getItem(
      this.resultsPerPagePreferenceInLocalStorage
    );
    return resultsLocalStorageValue
      ? resultsLocalStorageValue
      : `${RESULTS_PER_PAGE_OPTIONS[RESULTS_PER_PAGE_OPTIONS.length - 1]}`;
  }

  getSizePreference() {
    const sizeLocalStorageValue = localStorage.getItem(
      this.sizePreferenceInLocalStorage
    );
    return sizeLocalStorageValue ? sizeLocalStorageValue : SIZE_OPTIONS.small;
  }

  getSortPreference() {
    const sortLocalStorageValue = localStorage.getItem(
      this.sortPreferenceInLocalStorage
    );
    return sortLocalStorageValue
      ? sortLocalStorageValue
      : SORT_OPTIONS.descending;
  }

  getSpecificUserIdsInLocalStorage(userIds: string[]) {
    const userIdsInLocalStorage = this.getUserIdsInLocalStorage();
    if (!userIdsInLocalStorage) return null;

    const toReturn: UserIds = {};

    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      const userIdUsername = userIdsInLocalStorage[userId as any];
      if (userIdUsername) toReturn[userId as any] = userIdUsername;
    }

    return toReturn;
  }

  getUserIdsInLocalStorage(): UserIds | null {
    const userIdsInLocalStorage = localStorage.getItem(
      this.userIdsInLocalStorage
    );
    if (userIdsInLocalStorage) {
      const parsed = JSON.parse(userIdsInLocalStorage);
      if (Math.abs(parsed.lastSearchDate - Date.now()) >= this.userIdsMaxLife) {
        localStorage.removeItem(this.userIdsInLocalStorage);
        return null;
      }
      return parsed;
    } else return null;
  }

  saveDeals(fetchedDeals: FetchedDeals) {
    if (!fetchedDeals || Object.keys(fetchedDeals).length === 0) return;
    const localStorageDeals = this.getLocalStorageDeals();
    localStorage.setItem(this.dealsInLocalStorage, JSON.stringify({...localStorageDeals, ...fetchedDeals}));
  }

  saveResultsPerPagePreference(resultsPerPagePreference: string) {
    localStorage.setItem(
      this.resultsPerPagePreferenceInLocalStorage,
      resultsPerPagePreference
    );
  }

  saveSizePreference(sizePreference: string) {
    localStorage.setItem(this.sizePreferenceInLocalStorage, sizePreference);
  }

  saveSortPreference(sortPreference: string) {
    localStorage.setItem(this.sortPreferenceInLocalStorage, sortPreference);
  }

  saveUserIds(userIds: string[]) {
    //gets already stored values and combines them with new values and then saves the whole shebang
    this.isFinishedSavingUserIds = false;
    const userIdsInLocalStorage = this.getUserIdsInLocalStorage();

    const userIdsToFetch = [];
    if (userIdsInLocalStorage) {
      for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        if (!userIdsInLocalStorage[userId as any]) userIdsToFetch.push(userId);
      }
    }

    this.helpersService
      .getUsers(userIdsInLocalStorage ? userIdsToFetch : userIds)
      ?.subscribe((userIdObjs: any) => {
        const toSave: UserIds = {};

        if (userIdObjs) {
          for (let i = 0; i < userIdObjs.length; i++) {
            const userIdObj: UserIds = userIdObjs[i];
            const keys = Object.keys(userIdObj);
            toSave[keys[0]] = userIdObj[keys[0]];
          }
        }

        toSave['lastSearchDate'] = (userIdsInLocalStorage as any)
          ?.lastSearchDate
          ? (userIdsInLocalStorage as any)?.lastSearchDate
          : Date.now();

        const combination = { ...userIdsInLocalStorage, ...toSave };
        localStorage.setItem(
          this.userIdsInLocalStorage,
          JSON.stringify(combination)
        );
        this.isFinishedSavingUserIds = true;
      });

    this.loadUserIdObjsIntoRedux(userIds);
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

  private getGameIds(games: GameRelevant[]) {
    return games.map((game) => (game as any)._id);
  }

  private getGameFromGameId(gameId: string) {
    const localStorageGames = this.getLocalStorageGames();
    const toReturn = localStorageGames[gameId] as any;
    return toReturn;
  }

  public getIndexToAddGameIntoGames(games: GameRelevant[], game: GameRelevant) {
    //assumes games is in descending order already
    //assumes completionDates are unique (they are date ints)
    //find index at which game.completionDate >= games[index].completionDate and <= game[index + 1].completionDate then return that index + 1;
    const maxNumberOfGamesToDoLinearly = 25;
    const shouldDoLinearly = games.length <= maxNumberOfGamesToDoLinearly;
    const DEFAULT_RETURN_VALUE = games.length - 1;
    let indexWhereConditionMet = DEFAULT_RETURN_VALUE;

    //note: the point of the loops is to find where the condition is met and assign j to indexWhereConditionMet

    if (shouldDoLinearly) {
      const secondToLastGameToCheck = games[games.length - 2];
      const lastGameToCheck = games[DEFAULT_RETURN_VALUE];

      if (game.completionDate > lastGameToCheck.completionDate) {
        for (let j = 0; j < games.length; j++) {
          if (j === DEFAULT_RETURN_VALUE) indexWhereConditionMet = j;

          const gameToCheck = games[j];
          const gameToCheckNext = games[j + 1];

          if (game.completionDate >= gameToCheck.completionDate) {
            // console.log('1------------------------------------------------');
            indexWhereConditionMet = -1;
            break;
          } else if (
            game.completionDate >= lastGameToCheck.completionDate &&
            game.completionDate <= secondToLastGameToCheck.completionDate
          ) {
            // console.log('2------------------------------------------------');
            indexWhereConditionMet = games.length - 2;
            break;
          } else if (
            game.completionDate < gameToCheck.completionDate &&
            game.completionDate >= gameToCheckNext.completionDate
          ) {
            // console.log('3------------------------------------------------');
            indexWhereConditionMet = j;
            break;
          }
        }
      }
    } else {
      let currentIndex = Math.floor(games.length / 2);
      let maxIndex = DEFAULT_RETURN_VALUE;
      let minIndex = 0;
      let afterCurrentGame: GameRelevant;
      let currentGame: GameRelevant;

      const lastGame = games[DEFAULT_RETURN_VALUE];
      const firstGame = games[minIndex];

      if (game.completionDate >= firstGame.completionDate)
        indexWhereConditionMet = -1;
      else if (game.completionDate <= lastGame.completionDate)
        indexWhereConditionMet = DEFAULT_RETURN_VALUE;
      else {
        let iterationCount = 0;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          //bail out if too many iterations
          if (iterationCount > games.length - 2) break;

          //afterCurrentGame should never be undefined as the if and else if checks above will prevent it
          currentGame = games[currentIndex];
          afterCurrentGame = games[currentIndex + 1];

          //this is the condition to satisfy
          if (
            game.completionDate <= currentGame.completionDate &&
            game.completionDate >= afterCurrentGame.completionDate
          ) {
            indexWhereConditionMet = currentIndex;
            break;
          } else {
            //#region adjusting indexes
            let currentIsLarger = true;
            if (game.completionDate > currentGame.completionDate)
              currentIsLarger = false;

            if (currentIsLarger) minIndex = currentIndex;
            else maxIndex = currentIndex;

            currentIndex = Math.floor((maxIndex - minIndex) / 2 + minIndex);
            //#endregion
          }

          // if (iterationCount < 4) {
          //   console.log('min =', minIndex);
          //   console.log('max =', maxIndex);
          //   console.log('current =', currentIndex);
          //   console.log('maxIndex - minIndex) / 2 =', (maxIndex - minIndex) / 2 + minIndex);
          //   console.log('currentIndex =', currentIndex);
          // }

          iterationCount++;
        }
        // console.log('iterationCount =', iterationCount);
      }
    }

    return indexWhereConditionMet + 1;
  }

  private loadUserIdObjsIntoRedux(relevantUserIds: string[]) {
    clearInterval(this.checkForIdsInterval);
    let userIdObjs: UserIds | null = this.getSpecificUserIdsInLocalStorage(
      relevantUserIds
    );

    if (!userIdObjs || Object.keys(userIdObjs).length !== relevantUserIds.length) {
      let checkCount = 0;
      this.checkForIdsInterval = setInterval(() => {
        checkCount++;

        if (checkCount === this.maxTimesToCheckForIds || this.isFinishedSavingUserIds) {
          clearInterval(this.checkForIdsInterval);
          userIdObjs = this.getSpecificUserIdsInLocalStorage(relevantUserIds);
          if (!userIdObjs) userIdObjs = {} as UserIds;
          this.store.dispatch(new SetUserIds(userIdObjs));
        }

        userIdObjs = this.getSpecificUserIdsInLocalStorage(relevantUserIds);
        
        if (userIdObjs && Object.keys(userIdObjs).length === relevantUserIds.length) {
          clearInterval(this.checkForIdsInterval);
          this.store.dispatch(new SetUserIds(userIdObjs));
        }

      }, this.checkForIdsIntervalDuration);
    } else this.store.dispatch(new SetUserIds(userIdObjs));
  }

  private saveGameIds(games: GameRelevant[]) {
    const localStorageGames = this.getLocalStorageGames() as any;

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      if (!game) continue;

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
