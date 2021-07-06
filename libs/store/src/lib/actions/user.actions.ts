import { Action } from "@ngrx/store";
import { LocalStorageUser, User } from "@nx-bridge/interfaces-and-types";

export const SET_USERS = '[Users] SET_USERS';
export const SET_CURRENTLY_VIEWING_USER = '[Users] SET_CURRENTLY_VIEWING_USER';

export class SetUsers implements Action {
  readonly type = SET_USERS;
  constructor(public payload: User[]){}
}

export class SetCurrentlyViewingUser implements Action {
  readonly type = SET_CURRENTLY_VIEWING_USER;
  constructor(public payload: LocalStorageUser){}
}

export type UserActions = SetUsers | SetCurrentlyViewingUser;