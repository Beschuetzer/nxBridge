import { TestBed } from '@angular/core/testing';
import {
  Game,
  GameRoundEndingScores,
  LocalStorageUser,
  LocalStorageUsers,
  Points,
  Room,
} from '@nx-bridge/interfaces-and-types';

import { LocalStorageManagerService } from './local-storage-manager.service';

const localStorageItem = 'users';
const userId = '601f8832fd5d073213bc4a37';
const userObj: LocalStorageUser = {
  username: 'Adam',
  email: 'der_beschuetzer1111@comcast.net',
  games: [{} as Game],
  gameIds: [],
  lastSearchDate: 1625627865326,
  lastGameCount: 48,
};
const localStorageUsers: LocalStorageUsers = {
  [userId as any]: userObj,
};

const game: Game = {
  completionDate: 123,
  deals: ['123', '234'] as string[],
  gameRoundEndingScores: {} as GameRoundEndingScores,
  players: ['123', '234', '34', '343'],
  points: {} as Points,
  room: {} as Room,
  startDate: 123456,
};

describe('LocalStorageManagerService', () => {
  let service: LocalStorageManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieving localStorage users', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUsers()).toEqual(localStorageUsers);
  });

  it('retrieving localStorage users - non-existant', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    expect(service.getLocalStorageUsers()).toEqual(
      service.EMPTY_LOCAL_STORAGE_USERS_RETURNS
    );
  });

  it('retrieving localStorage user - present', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUser(userId)).toEqual(userObj);
  });

  it('retrieving localStorage user - not present', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUser('adam')).toEqual(undefined);
  });

  it('creating localStorage user - update existing', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    const username = 'Adam';
    const games: Game[] = [];
    const email = 'adam2@gmail.com';
    const gameCount = 102;
    const time = Date.now();

    const expected = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
      },
    };

    expect(
      service.createLocalStorageUser(userId, username, email, games, gameCount)
    ).toEqual(expected);
  });

  it('creating localStorage user - update two', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    const username = 'Tom';
    const games: Game[] = [];
    const email = 'tom@gmail.com';
    const gameCount = 100;
    const time = Date.now();

    const expected = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
      },
    };

    expect(
      service.createLocalStorageUser(userId, username, email, games, gameCount)
    ).toEqual(expected);

    const username2 = 'Tom2';
    const games2: Game[] = [];
    const email2 = 'tom2@gmail.com';
    const gameCount2 = 1000;
    const time2 = Date.now();
    const id2 = '123456';

    const expected2 = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
      },
      [id2]: {
        games: games2,
        email: email2,
        lastGameCount: gameCount2,
        lastSearchDate: time2,
        username: username2,
      },
    };
    expect(
      service.createLocalStorageUser(id2, username2, email2, games2, gameCount2)
    ).toEqual(expected2);
  });

  it('creating localStorage user - invalid username', () => {
    localStorage.removeItem(localStorageItem);
    const username = '';
    const games: Game[] = [];
    const gameIds: string[] = [];
    const email = 'adam2@gmail.com';
    const gameCount = 102;

    const result = service.createLocalStorageUser(
      userId,
      username,
      email,
      games,
      gameCount
    );
    const expected: LocalStorageUsers = {
      [userId]: {
        username,
        games,
        gameIds,
        email,
        lastSearchDate: result ? result[userId]?.lastSearchDate : 0,
        lastGameCount: gameCount,
      },
    };

    expect(
      service.createLocalStorageUser(userId, username, email, games, gameCount)
    ).toEqual(expected);
  });

  it('getting last game count - no local storage', () => {
    localStorage.removeItem(localStorageItem);
    expect(service.getLastGameCount('Adam')).toBe(0);
  });

  it('getting last game count - invalid userId', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getLastGameCount('')).toBe(0);
  });

  it('getting last game count - valid', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getLastGameCount(userId)).toBe(userObj.lastGameCount);
  });

  it('getting id from username - valid', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getIdFromUsername('Adam')).toBe(userId);
  });

  it('getting id from username - not present', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getIdFromUsername('Adams')).toBe(
      service.EMPTY_USER_ID_RETURNS
    );
  });

  it('getting id from email - valid', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getIdFromEmail(userObj.email)).toBe(userId);
  });

  it('getting id from email - not present', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));
    expect(service.getIdFromEmail('adam22@gmail.com')).toBe(
      service.EMPTY_USER_ID_RETURNS
    );
  });

  it('append game', () => {
    localStorage.setItem(localStorageItem, JSON.stringify(localStorageUsers));

    const userObjCopy = userObj;
    (userObjCopy.games as Game[]).push(game);

    const result = service.appendGamesToLocalStorageUser(userId, [
      game,
    ]) as LocalStorageUser;
    userObjCopy.lastGameCount = result.lastGameCount;
    userObjCopy.lastSearchDate = result.lastSearchDate;
    expect(result).toEqual(userObjCopy);
  });
});

//

describe('getIndexToAddGameIntoGames - linearly', () => {
  let service: LocalStorageManagerService;

  const numberofGames = 100
  const games = getDescendingArray(numberofGames);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageManagerService);
  });

  it('append to front', () => {
    const game = { completionDate: numberofGames };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = 0;
    expect(result).toEqual(expected);
  });

  it('after second to last', () => {
    const numberToInsert = 1.5
    const game = { completionDate: numberToInsert };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = Math.ceil(numberofGames - numberToInsert);
    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });
  
  it('last', () => {
    const game = { completionDate: 0.5 };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = games.length;
    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });

  it('middle', () => {
    const numberToInsert = 5.5
    const game = { completionDate: numberToInsert };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = Math.ceil(numberofGames - numberToInsert);
    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });
});

describe('getIndexToAddGameIntoGames - binarily', () => {
  let service: LocalStorageManagerService;

  const numberOfGames = 101;
  const games = getDescendingArray(numberOfGames);

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageManagerService);
  });

  it('append to front', () => {
    const game = { completionDate: 102 };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = 0;
    expect(result).toEqual(expected);
  });

  it('after second to last', () => {
    const game = { completionDate: 1.5 };
    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = games.length - 1;

    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });
  
  it('last', () => {
    const game = { completionDate: 0.5 };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = games.length;
    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });

  it('middle', () => {
    const numberToInsert = 5.5
    const game = { completionDate: numberToInsert };

    const result = service.getIndexToAddGameIntoGames(
      games as Game[],
      game as Game
    );
    const expected = Math.ceil(numberOfGames - numberToInsert);
    console.log('expected =', expected);
    console.log('result =', result);
    expect(result).toEqual(expected);
  });
});



function getDescendingArray(length: number ) {
  const result: Game[] = [];
  for (let i = length; i > 0 ; i--) {
    result.push({completionDate: i} as Game);
  }
  return result;
}