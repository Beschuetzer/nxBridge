import { TestBed } from '@angular/core/testing';
import { Game } from '@nx-bridge/interfaces-and-types';

import { LocalStorageManagerService, LocalStorageUsers } from './local-storage-manager.service';

describe('LocalStorageManagerService', () => {
  let service: LocalStorageManagerService;

  const userObj = {
    id: '12345',
    email: 'test123@gmail.com',
    games: [
      {} as Game,
    ],
    lastSearchDate: 123456,
    lastGameCount: 10,
  }
  const localStorageUsers: LocalStorageUsers = {
    'Adam': userObj
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
    expect(service.getLocalStorageUser("Adam")).toEqual(userObj);
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
    const id = "11233";

    const expected = {
      [username]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        id,
      }
    }

    expect(service.updateLocalStorageUsers(username, games, email, gameCount, id, time)).toEqual(expected);
  });

  it('updating localStorage user - update two', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    const username = "Tom";
    const games: Game[] = [];
    const email = "tom@gmail.com";
    const gameCount = 100;
    const time = Date.now();
    const id = "11233";

    const expected = {
      [username]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        id,
      }
    }

    expect(service.updateLocalStorageUsers(username, games, email, gameCount, id, time)).toEqual(expected);

    const username2 = "Tom2";
    const games2: Game[] = [];
    const email2 = "tom2@gmail.com";
    const gameCount2 = 1000;
    const time2 = Date.now();
    const id2 = "1123344";

    const expected2 = {
      [username]: {
        games,
        email,
        lastGameCount: gameCount,
        lastSearchDate: time,
        id,
      },
      [username2]: {
        games: games2, 
        email: email2, 
        lastGameCount: gameCount2,
        lastSearchDate: time2,
        id: id2, 
      }
    }

    expect(service.updateLocalStorageUsers(username2, games2, email2, gameCount2, id2, time2)).toEqual(expected2);
  });

  it('updating localStorage user - invalid username', () => {
    const username = "";
    const games: Game[] = [];
    const email = "adam2@gmail.com";
    const gameCount = 102;
    const time = Date.now();
    const id = "11233";

    expect(service.updateLocalStorageUsers(username, games, email, gameCount, id, time)).toEqual(null);
  });
});
