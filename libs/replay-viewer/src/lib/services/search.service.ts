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
  SetDealsAsStrings,
  DealState,
  SetFetchedDeals,
} from '@nx-bridge/store';
import { Store } from '@ngrx/store';
import {
  DealRequest,
  FetchedDeals,
  GameRelevant,
  GetUserResponse,
  LocalStorageUserWithGames,
  ReducerNames,
} from '@nx-bridge/interfaces-and-types';
import { paginateGames, rootRoute } from '@nx-bridge/constants';
import { LocalStorageManagerService } from './local-storage-manager.service';
import { ERROR_APPENDING_GAMES } from '@nx-bridge/api-errors';
import { switchMap, take } from 'rxjs/operators';
import {} from '@nx-bridge/store';
import { FiltermanagerService } from './filter-manager.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    private filterManagerService: FiltermanagerService,
    private store: Store<AppState>,
    private router: Router,
    private route: ActivatedRoute,
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

  getAreDealsLoaded() {
    let areLoaded = false;
    this.store
      .select(ReducerNames.deals)
      .pipe(take(1))
      .subscribe((dealState) => {
        areLoaded = Object.keys(dealState.fetchedDeals).length > 0;
      });
    return areLoaded;
  }

  getAreGamesLoaded() {
    let areGamesLoaded = false;
    this.store.select(ReducerNames.deals).pipe(take(1)).subscribe(dealState => {
      areGamesLoaded = Object.keys(dealState.fetchedDeals).length > 0;
    })
    return areGamesLoaded;
  }

  getIsLoading() {
    let isLoading = false;
    this.store
      .select(ReducerNames.general)
      .pipe(take(1))
      .subscribe((generalState) => {
        isLoading = generalState.isLoading;
      });
    return isLoading;
  }

  setCurrentlyDisplayingGames() {
    //NOTE: assumming the games are sorted in descending order at this point (happens in getLocalStorageUserWithGames)
    let sortPreference: string;
    let resultsPerPage: string;
    let batchNumber: number;
    let games: GameRelevant[];

    this.store
      .select(ReducerNames.general)
      .pipe(
        take(1),
        switchMap((generalState) => {
          sortPreference = generalState.sortingPreference;
          resultsPerPage = generalState.resultsPerPagePreference;
          batchNumber = generalState.batchNumber;

          if (!sortPreference)
            sortPreference = this.localStorageManager.getSortPreference();
          if (!resultsPerPage)
            resultsPerPage = this.localStorageManager.getResultsPerPagePreference();

          return this.store.select(ReducerNames.users).pipe(take(1));
        })
      )
      .subscribe((userState) => {
        games = userState.currentlyViewingUser.games;

        if (!games) return;
        // debugger;
        //note: batch number starts at 0 (meaning results 0 - 0 * resultsPerPage)

        const filteredGames = this.filterManagerService.filterGames(games);
        const gamesToUse = paginateGames(
          filteredGames,
          sortPreference,
          batchNumber > 0 ? batchNumber : 0,
          +resultsPerPage
        );

        this.store.dispatch(new SetCurrentlyDisplayingGames(gamesToUse));
      });
  }

  startRequest(username: string, email: string) {
    console.log('username =', username);
    console.log('email =', email);
    const shouldContinue = this.getShouldContinue(username, email);
    if (!shouldContinue) {
      this.filterManagerService.reset();
      this.store.dispatch(new SetIsLoading(false));
      const areGamesLoaded = this.getAreGamesLoaded();
      if (areGamesLoaded && this.router.url !== `/${rootRoute}/games`) {
        this.router.navigate([rootRoute , 'games']);
        this.setCurrentlyDisplayingGames();
        return;
      } 
      else return `Already viewing the games of <b>'${username ? username : email}'</b>.`;
    }

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

  private getDealsToLoad(neededDeals: DealRequest, neededDealsAsStrings: string[], localStorageDeals: FetchedDeals) {
    const dealsToLoad: DealRequest = neededDeals;
    
    let dealsAvailable: FetchedDeals = {};
    if(localStorageDeals) dealsAvailable = localStorageDeals;

    for (let i = 0; i < neededDealsAsStrings.length; i++) {
      const neededDealAsString = neededDealsAsStrings[i];
      if (dealsAvailable[neededDealAsString]) {
        delete dealsToLoad[neededDealAsString];
      }
    }

    return dealsToLoad;
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

  private getGameCount() {
    this.localGameCount = this.localStorageManager.getLastGameCount(
      this.userId as string
    );

    const localStorageGames = this.localStorageManager.getLocalStorageGames();
    
    if (this.localGameCount > Object.keys(localStorageGames).length) {
      this.localGameCount = 0;
    }

    this.helpersService
      .getGameCount(this.userId as string)
      .subscribe((gameCount) => {
        this.gameCountFromServer = gameCount;
        this.handleGetGameCountResponse();
      });
  }

  private getLocalStorageUserWithGames(games: GameRelevant[]) {
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

    return this.localStorageManager.getPopulatedLocalStorageUser(
      this.userId
    );
  }

  private getShouldContinue(username: string, email: string) {
    let shouldContinue = false;
    this.store
      .select(ReducerNames.users)
      .pipe(take(1))
      .subscribe((userState) => {
        if (!username && !email) shouldContinue = false;
        if (!username) shouldContinue = userState.currentlyViewingUser.email !== email; 
        else if (!email) shouldContinue = userState.currentlyViewingUser.username !== username;
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

  private handleGetGamesResponse(games: GameRelevant[]) {
    console.log('games =', games);

    const localStorageUserWithGames = this.getLocalStorageUserWithGames(games);
    if (!localStorageUserWithGames) return;

    this.localStorageManager.saveUserIds(localStorageUserWithGames?.userIds as string[]);

    this.loadDeals(localStorageUserWithGames as LocalStorageUserWithGames);
    
    this.store.dispatch(
      new SetCurrentlyViewingUser(
        localStorageUserWithGames
          ? localStorageUserWithGames
          : ({} as LocalStorageUserWithGames)
      )
    );
    this.setCurrentlyDisplayingGames();
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
          `There is no user with that ${
            this.username ? 'username' : 'email'
          }. &nbsp;&nbsp;He/She may have recently changed their ${this.username ? 'username' : 'email'} to something other than '${this.username ? this.username : this.email}'.`
        )
      );
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private loadDeals(localStorageUserWithGames: LocalStorageUserWithGames) {
    const [neededDeals, neededDealsAsStrings] = this.helpersService.getNeededDeals(
      localStorageUserWithGames?.games as GameRelevant[]
    );
    
    if (neededDealsAsStrings.length <= 0) return;
    this.store.dispatch(new SetDealsAsStrings(neededDealsAsStrings));
   
    const localStorageDeals = this.localStorageManager.getLocalStorageDeals();

    const dealsToGet = this.getDealsToLoad(neededDeals, neededDealsAsStrings, localStorageDeals ? localStorageDeals : {})

    if (Object.keys(dealsToGet).length > 0) {
      this.store.select(ReducerNames.deals).pipe(
        take(1),
        switchMap((dealState: DealState) => {
          return this.helpersService.getDeals(dealsToGet);
        })
      ).subscribe((deals: FetchedDeals) => {
        // const fetchedDeals = this.convertDealsToFetchedDeals(deals);
        const combinedDeals = {...localStorageDeals, ...deals};
        this.localStorageManager.saveDeals(combinedDeals);

        const relevantDeals = this.getRelevantDeals(combinedDeals, neededDealsAsStrings);
        this.store.dispatch(new SetFetchedDeals(relevantDeals));
        this.store.dispatch(new SetIsLoading(false));
      })
    } else {
      const relevantDeals = this.getRelevantDeals(localStorageDeals ? localStorageDeals : {}, neededDealsAsStrings);
      this.store.dispatch(new SetFetchedDeals(relevantDeals));
      this.store.dispatch(new SetIsLoading(false));
    }
  }

  private getRelevantDeals(combinedDeals: FetchedDeals, neededDealsAsStrings: string[]) {
    const relevantDeals: FetchedDeals = {};

    for (let i = 0; i < neededDealsAsStrings.length; i++) {
      const neededDealsAsString = neededDealsAsStrings[i];
      relevantDeals[neededDealsAsString] = combinedDeals[neededDealsAsString];
    }

    return relevantDeals
  }
}
