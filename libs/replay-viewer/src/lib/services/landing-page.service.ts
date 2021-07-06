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
import { User } from '@nx-bridge/interfaces-and-types';
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
    const parsed = localStorageUsers ? localStorageUsers[username] : null;

    if (!(parsed as any)?.id) {
      this.helpersService.getUser(username, email).subscribe((user) => {
        this.handleGetUserResponse(user, username, email);
      });
    } else {
      this.helpersService.getGames((parsed as any)._id);
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private handleGetUserResponse(user: User, username: string, email: string) {
    if (user) {
      localStorage.setItem(
        'user',
        JSON.stringify({
          ...user,
          email: null,
          salt: null,
          hash: null,
          resetPasswordExpires: null,
          resetPasswordToken: null,
        } as User)
      );
      this.helpersService.getGames((user as any)._id);
    } else {
      localStorage.removeItem('user');

      this.store.dispatch(
        new ngrxStore.SetLoadingError(
          `There is no user with the ${
            username ? 'username' : 'email'
          } of '${username ? username : email}'.`
        )
      );
    }
    this.store.dispatch(new ngrxStore.SetIsLoading(false));
  }
}
