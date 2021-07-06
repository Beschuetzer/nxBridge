import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HelpersService } from '@nx-bridge/helpers';
import { AppState, SetGames, SetIsLoading, SetLoadingError } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import * as ngrxStore from '@nx-bridge/store';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  public userId: string | null = null;
  public userObj: User | null = null;
  public localGameCount = 0;
  public gameCountFromServer = 0;


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

  startRequest(username: string, email: string) {
    const localStorageUsers = this.localStorageManager.getLocalStorageUsers();
    this.userId = localStorageUsers ? this.localStorageManager.getIdFromUsername(username) : '';

    if (!this.userId) {
      this.helpersService.getUser(username, email).subscribe((user) => {
        this.handleGetUserResponse(user, username, email);
      });
    } else this.getGameCount();
  }

  private handleGetUserResponse(user: User, username: string, email: string) {
    if (user) {
      this.userObj = user;
      this.userId = (user as any)._id;
      this.getGameCount();
    } else {
      this.store.dispatch(
        new SetLoadingError(
          `There is no user with the ${username ? 'username' : 'email'} of '${
            username ? username : email
          }'.`
        )
      );
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private getGameCount() {
    this.localGameCount = this.localStorageManager.getLastGameCount(this.userId as string);
    this.helpersService.getGameCount(this.userId as string).subscribe(gameCount => {
      this.gameCountFromServer = gameCount;
      this.handleGetGameCountResponse();
    })
  }

  private handleGetGameCountResponse() {
    this.helpersService.getGames(this.userId as string, Math.abs(this.gameCountFromServer - this.localGameCount)).subscribe((games) => {
      this.handleGetGamesResponse(games);
    });
  }

  private handleGetGamesResponse(games: Game[]) {
    console.log('games =', games);
    this.store.dispatch(new SetGames(games));
    this.helpersService.loadDealsIntoRedux(games);
    debugger;
    this.store.dispatch(new SetIsLoading(false));
    this.localStorageManager.appendGamesToLocalStorageUser(this.userId as string, games);
    this.localStorageManager.appendLocalStorageUser(this.userObj as User, games, this.gameCountFromServer + this.localGameCount);
  }
}
