import { TestBed } from '@angular/core/testing';
import { Game, GameRoundEndingScores, Points, Preferences, Room } from '@nx-bridge/interfaces-and-types';

import { LocalStorageManagerService, LocalStorageUsers } from './local-storage-manager.service';

describe('LocalStorageManagerService', () => {
  let service: LocalStorageManagerService;

  const userId = '12345';
  const userObj = {
    username: 'Adam',
    email: 'adam@gmail.com',
    games: [
      {} as Game,
    ],
    lastSearchDate: 123456,
    lastGameCount: 10,
    preferences: {} as Preferences,
  }
  const localStorageUsers: LocalStorageUsers = {
    [userId]: userObj,
  } 

  const game: Game = {
    completionDate: 123,
    deals: ['123','234'] as string[],
    gameRoundEndingScores: {} as GameRoundEndingScores,
    players: ['123','234','34','343'],
    points: {} as Points,
    room: {} as Room,
    startDate: 123456,
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('retrieving localStorage users', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUsers()).toEqual(localStorageUsers);
  });

  it('retrieving localStorage users - non-existant', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    expect(service.getLocalStorageUsers()).toEqual(service.EMPTY_LOCAL_STORAGE_RETURNS);
  });

  it('retrieving localStorage user - present', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUser(userId)).toEqual(userObj);
  });

  it('retrieving localStorage user - not present', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getLocalStorageUser("adam")).toEqual(undefined);
  });

  it('updating localStorage user - update existing', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    const username = "Adam";
    const games: Game[] = [];
    const email = "adam2@gmail.com";
    const gameCount = 102;
    const time = Date.now();
    const preferences = {} as Preferences;

    const expected = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
        preferences,
      }
    }

    expect(service.appendLocalStorageUser(userId, username, games, email, gameCount, time, preferences)).toEqual(expected);
  });

  it('updating localStorage user - update two', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    const username = "Tom";
    const games: Game[] = [];
    const email = "tom@gmail.com";
    const gameCount = 100;
    const time = Date.now();
    const preferences = {} as Preferences;

    const expected = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
        preferences,
      }
    }

    expect(service.appendLocalStorageUser(userId, username, games, email, gameCount, time, preferences)).toEqual(expected);

    const username2 = "Tom2";
    const games2: Game[] = [];
    const email2 = "tom2@gmail.com";
    const gameCount2 = 1000;
    const time2 = Date.now();
    const id2 = "123456";

    const expected2 = {
      [userId]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        username,
        preferences: preferences,
      },
      [id2]: {
        games: games2, 
        email: email2, 
        lastGameCount: gameCount2,
        lastSearchDate: time2,
        username: username2, 
        preferences: preferences,
      }
    }

    expect(service.appendLocalStorageUser(id2, username2, games2, email2, gameCount2, time2, preferences)).toEqual(expected2);
  });

  it('updating localStorage user - invalid username', () => {
    const username = "";
    const games: Game[] = [];
    const email = "adam2@gmail.com";
    const gameCount = 102;
    const time = Date.now();
    const preferences = {} as Preferences;

    expect(service.appendLocalStorageUser(userId, username, games, email, gameCount, time, preferences)).toEqual(null);
  });

  it('getting last game count - no local storage', () => {
    localStorage.removeItem('users');
    expect(service.getLastGameCount("Adam")).toBe(0);
  });

  it('getting last game count - invalid username', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getLastGameCount("")).toBe(0);
  });

  it('getting last game count - valid', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getLastGameCount(userId)).toBe(10);
  });

  it('getting id from username - valid', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getIdFromUsername("Adam")).toBe(userId);
  });

  it('getting id from username - not present', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getIdFromUsername("Adams")).toBe(service.EMPTY_USER_ID_RETURNS);
  });

  it('getting id from email - valid', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getIdFromEmail("adam@gmail.com")).toBe(userId);
  });

  it('getting id from email - not present', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));
    expect(service.getIdFromEmail("adam22@gmail.com")).toBe(service.EMPTY_USER_ID_RETURNS);
  });

  it('append game', () => {
    localStorage.setItem('users', JSON.stringify(localStorageUsers));

    const userObjCopy = userObj;
    userObjCopy.games.push(game);

    const result = service.appendGamesToLocalStorageUser(userId, [game]);
    expect(result?.games).toEqual(userObjCopy.games);
  });
});
