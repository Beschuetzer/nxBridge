import { Action } from "@ngrx/store";
import { User } from "@nx-bridge/interfaces-and-types";

export const SET_USERS = '[Setup] SET_USERS';

export class SetUsers implements Action {
  readonly type = SET_USERS;
  constructor(public payload: User[]){}
}

export type UserActions = SetUsers;