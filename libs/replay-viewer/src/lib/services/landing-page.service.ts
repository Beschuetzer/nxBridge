import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HelpersService } from '@nx-bridge/helpers';
import { AppState, SetIsLoading } from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { Game, User } from '@nx-bridge/interfaces-and-types';
import * as ngrxStore from '@nx-bridge/store';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
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
    const localStorageUser = localStorageUsers ? this.localStorageManager.getIdFromUsername(username) : null;

    if (!localStorageUser) {
      this.helpersService.getUser(username, email).subscribe((user) => {
        this.handleGetUserResponse(user, username, email);
      });
    } else {
      this.helpersService.getGames((localStorageUser as any)._id).subscribe((games) => {
        this.handleGetGamesResponse(games);
      });
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private handleGetGamesResponse(games: Game[]) {
    console.log('games =', games);
    this.store.dispatch(new ngrxStore.SetGames(games));
    this.helpersService.loadDealsIntoRedux(games);
  }

  private handleGetUserResponse(user: User, username: string, email: string) {
    if (user) {
      this.helpersService.getGames((user as any)._id);
    } else {
      this.store.dispatch(
        new ngrxStore.SetLoadingError(
          `There is no user with the ${username ? 'username' : 'email'} of '${
            username ? username : email
          }'.`
        )
      );
    }
    this.store.dispatch(new ngrxStore.SetIsLoading(false));
  }
}
