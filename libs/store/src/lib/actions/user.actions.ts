import { Action } from "@ngrx/store";
import { LocalStorageUserWithGames, UserIds } from "@nx-bridge/interfaces-and-types";

export const SET_USERS = '[Users] SET_USERS';
export const SET_CURRENTLY_VIEWING_USER = '[Users] SET_CURRENTLY_VIEWING_USER';

export class SetUserIds implements Action {
  readonly type = SET_USERS;
  constructor(public payload: UserIds){}
}

export class SetCurrentlyViewingUser implements Action {
  readonly type = SET_CURRENTLY_VIEWING_USER;
  constructor(public payload: LocalStorageUserWithGames){}
}

export type UserActions = SetUserIds | SetCurrentlyViewingUser;