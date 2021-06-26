import { User } from "@nx-bridge/interfaces-and-types";
import * as UserActions from '../actions/user.actions';

export interface UserState {
  users: User[]
}

const INITIAL_STATE = {
  users: [],
}

export const userReducer = (state = INITIAL_STATE, action: UserActions.UserActions ) => {
  switch (action.type) {
    case UserActions.SET_USERS:
      return {
        ...state,
        users: action.payload,
      }      
  
    default:
      return state;
  }
}