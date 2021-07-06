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
  const LocalStorageUsers: LocalStorageUsers = {
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
    localStorage.setItem('users', JSON.stringify(LocalStorageUsers));
    expect(service.getLocalStorageUsers()).toEqual(LocalStorageUsers);
  });

  it('retrieving localStorage users - non-existant', () => {
    localStorage.removeItem(service.usersInLocalStorage);
    expect(service.getLocalStorageUsers()).toEqual(service.EMPTY_LOCAL_STORAGE_RETURNS);
  });

  it('retrieving localStorage user - present', () => {
    localStorage.setItem('users', JSON.stringify(LocalStorageUsers));
    expect(service.getLocalStorageUser("Adam")).toEqual(userObj);
  });

  it('retrieving localStorage user - not present', () => {
    localStorage.setItem('users', JSON.stringify(LocalStorageUsers));
    expect(service.getLocalStorageUser("adam")).toEqual(undefined);
  });
});
