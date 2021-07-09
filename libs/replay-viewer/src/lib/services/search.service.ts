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
  SetCurrentlyDisplayingGames,
  SetCurrentlyViewingUser,
  SetIsLoading,
  SetLoadingError,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  GetUserResponse,
  LocalStorageUserWithGames,
  SortOptions,
} from '@nx-bridge/interfaces-and-types';
import { paginateGames, SORT_OPTIONS } from '@nx-bridge/constants';
import { Game } from '@nx-bridge/interfaces-and-types';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { ERROR_APPENDING_GAMES } from '@nx-bridge/api-errors';
import { switchMap, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  public shouldNavigateToGames = false;
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
    if (
      formControl.value === undefined ||
      formControl.value === null ||
      formControl.value?.trim() === ''
    )
      return { isEmpty: true };
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

  setCurrentlyDisplayingGames(batchNumber = 0) {
    //NOTE: assumming the games are sorted in descending order at this point (happens in getLocalStorageUserWithGames)

    let sortPreference: string;
    let resultsPerPage: string;
    let games: Game[];

    this.store
      .select('general')
      .pipe(
        take(1),
        switchMap((generalState) => {
          sortPreference = generalState.sortingPreference;
          resultsPerPage = generalState.resultsPerPagePreference;

          if (!sortPreference)
            sortPreference = this.localStorageManager.getSortPreference();
          if (!resultsPerPage)
            resultsPerPage = this.localStorageManager.getResultsPerPagePreference();

          return this.store.select('users').pipe(take(1));
        })
      )
      .subscribe((userState) => {
        games = userState.currentlyViewingUser.games;

        debugger;
        //note: batch number starts at 0 (meaning results 0 - 0 * resultsPerPage)
        const gamesToUse = paginateGames(
          games,
          sortPreference,
          batchNumber,
          +resultsPerPage
        );
        this.filterGames(gamesToUse);

        this.store.dispatch(new SetCurrentlyDisplayingGames(gamesToUse));
      });
  }

  startRequest(username: string, email: string) {
    const shouldContinue = this.getShouldContinue(username, email);
    if (!shouldContinue)
      return `Already viewing games by that user.  Try scrolling down.`;

    this.needToCreateLocalStorageUser = false;
    this.username = username;
    this.email = email;
    this.userId = this.getLocalUserId();

    if (!this.userId) {
      this.helpersService
        .getUser(username, email)
        .subscribe((getUserResponse) => {
          this.handleGetUserResponse(getUserResponse);
        });
    } else this.getGameCount();
    return '';
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

  private getShouldContinue(username: string, email: string) {
    let shouldContinue = false;
    this.store
      .select('users')
      .pipe(take(1))
      .subscribe((userState) => {
        if (username)
          shouldContinue = userState.currentlyViewingUser.username !== username;
        else if (email)
          shouldContinue = userState.currentlyViewingUser.email !== email;
      });

    return shouldContinue;
  }

  private handleGetGameCountResponse() {
    const numberOfGamesToGet = Math.abs(
      this.gameCountFromServer - this.localGameCount
    );

    if (this.gameCountFromServer === 0 && this.localGameCount === 0) {
      const messageSuffix = 'has not finished any games yet...';
      let message = `'${this.username}' ${messageSuffix}`;
      if (!this.username && this.email)
        message = `The user with email '${this.email}' ${messageSuffix}`;
      this.store.dispatch(new SetLoadingError(message));
      return this.store.dispatch(new SetIsLoading(false));
    }

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

      if (!result)
        return this.store.dispatch(new SetLoadingError(ERROR_APPENDING_GAMES));
    }

    this.localStorageManager.updateEmailAndUsername(
      this.userId,
      this.username,
      this.email
    );

    const localStorageUserWithGames = this.localStorageManager.getLocalStorageUserWithGames(
      this.userId
    );
    this.helpersService.loadDealsIntoRedux(
      localStorageUserWithGames?.games as Game[]
    );
    this.store.dispatch(
      new SetCurrentlyViewingUser(
        localStorageUserWithGames
          ? localStorageUserWithGames
          : ({} as LocalStorageUserWithGames)
      )
    );
    this.setCurrentlyDisplayingGames();
    this.store.dispatch(new SetIsLoading(false));
  }

  private filterGames(games: Game[]) {
    //TODO: will need to put in the filter parts
  }
}
