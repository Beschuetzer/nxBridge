import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Store } from '@ngrx/store';
import { rootRoute } from '@nx-bridge/constants';
import { ReducerNames } from '@nx-bridge/interfaces-and-types';
import { AppState } from '@nx-bridge/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export type CanActivateOutputTypes =
  | Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | UrlTree
  | boolean;

@Injectable({
  providedIn: 'root',
})
export class CanActivateGamesView implements CanActivate {
  constructor(private router: Router, private store: Store<AppState>) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): CanActivateOutputTypes {
    let canActivate = true;

    this.store.select(ReducerNames.games).pipe(take(1)).subscribe(gameState => {
      canActivate = gameState.currentlyDisplayingGames.length > 0;
    });

    if (!canActivate) {
      return this.router.navigate([rootRoute]);
    }

    return true;
  }
}
