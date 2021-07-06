import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HelpersService } from '@nx-bridge/helpers';
import {
  AppState,
  SetCurrentlyViewingUser,
  SetIsLoading,
  SetLoadingError,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { GetUserResponse, LocalStorageUser } from '@nx-bridge/interfaces-and-types';
import { Game } from '@nx-bridge/interfaces-and-types';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { ERROR_APPENDING_GAMES } from '@nx-bridge/api-errors';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  public username = '';
  public email = '';
  public userId = '';
  public localGameCount = 0;
  public gameCountFromServer = 0;
  public needToCreateLocalStorageUser = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private localStorageManager: LocalStorageManagerService,
    private helpersService: HelpersService,
    private store: Store<AppState>
  ) {}

  static noEmpty = (formControl: AbstractControl) => {
    if (formControl.value === '') return { isEmpty: true };
    return null;
  };

  //NOTE: this is how you write an ValidatorFn that accepts params
  static numberRequired(numberRequired: number): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      let haveInputCount = 0;
      const controlKeys = Object.keys((formGroup as FormGroup).controls);

      for (let i = 0; i < controlKeys.length; i++) {
        const key = controlKeys[i];
        const control = (formGroup as FormGroup).controls[key];
        if (
          control.value !== '' &&
          control.value !== null &&
          control.value !== undefined
        )
          haveInputCount++;
      }

      if (haveInputCount < numberRequired) return { numberRequired: false };
      return null;
    };
  }

  private getLocalUserId() {
    const localStorageUsers = this.localStorageManager.getLocalStorageUsers();
    // debugger;

    if (!localStorageUsers) return '';
    let localUserId = this.localStorageManager.getIdFromUsername(this.username);

    if (!localUserId)
      localUserId = this.localStorageManager.getIdFromEmail(this.email);

    return localUserId;
  }

  startRequest(username: string, email: string) {
    this.needToCreateLocalStorageUser = false;
    this.username = username;
    this.email = email;
    this.userId = this.getLocalUserId();

    if (!this.userId) {
      this.helpersService.getUser(username, email).subscribe((getUserResponse) => {
        this.handleGetUserResponse(getUserResponse);
      });
    } else this.getGameCount();
  }

  private handleGetUserResponse(getUserResponse: GetUserResponse) {
    if (getUserResponse) {
      const localStorageUser = this.localStorageManager.getLocalStorageUser(
        getUserResponse.id
      );

      if (!localStorageUser) this.needToCreateLocalStorageUser = true;

      this.username = getUserResponse.username;
      this.userId = getUserResponse.id;
      this.getGameCount();
    } else {
      this.store.dispatch(
        new SetLoadingError(
          `There is no user with the ${
            this.username ? 'username' : 'email'
          } of '${this.username ? this.username : this.email}'.`
        )
      );
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private getGameCount() {
    this.localGameCount = this.localStorageManager.getLastGameCount(
      this.userId as string
    );
    this.helpersService
      .getGameCount(this.userId as string)
      .subscribe((gameCount) => {
        this.gameCountFromServer = gameCount;
        this.handleGetGameCountResponse();
      });
  }

  private handleGetGameCountResponse() {
    const numberOfGamesToGet = Math.abs(
      this.gameCountFromServer - this.localGameCount
    );
    // debugger;

    if (numberOfGamesToGet === 0) {
      const games = this.localStorageManager.getGames(this.userId);
      return this.handleGetGamesResponse(games ? games : []);
    }

    this.helpersService
      .getGames(this.userId as string, numberOfGamesToGet)
      .subscribe((games) => {
        this.handleGetGamesResponse(games);
      });
  }

  private handleGetGamesResponse(games: Game[]) {
    console.log('games =', games);
    this.helpersService.loadDealsIntoRedux(games);

    if (this.needToCreateLocalStorageUser)
      this.localStorageManager.createLocalStorageUser(
        this.userId,
        this.username,
        this.email,
        games,
        this.gameCountFromServer + this.localGameCount
      );
    else {
      const result = this.localStorageManager.appendGamesToLocalStorageUser(
        this.userId as string,
        games
      );

      if (!result) return this.store.dispatch(new SetLoadingError(ERROR_APPENDING_GAMES));
    }

    this.localStorageManager.updateEmailAndUsername(this.userId, this.username, this.email);

    // debugger;
    const localStorageUser = this.localStorageManager.getLocalStorageUser(
      this.userId
    );
    this.store.dispatch(
      new SetCurrentlyViewingUser(
        localStorageUser ? localStorageUser : ({} as LocalStorageUser)
      )
    );
    this.store.dispatch(new SetIsLoading(false));
  }
}
