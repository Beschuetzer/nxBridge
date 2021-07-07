import { LocalStorageUserWithGames, User } from "@nx-bridge/interfaces-and-types";
import * as UserActions from '../actions/user.actions';

export interface UserState {
  users: User[];
  currentlyViewingUser: LocalStorageUserWithGames;
}

const INITIAL_STATE = {
  users: [],
  currentlyViewingUser: {} as LocalStorageUserWithGames,
}

export const userReducer = (state = INITIAL_STATE, action: UserActions.UserActions ) => {
  switch (action.type) {
    case UserActions.SET_USERS:
      return {
        ...state,
        users: action.payload,
      }      
    case UserActions.SET_CURRENTLY_VIEWING_USER:
      return {
        ...state,
        currentlyViewingUser: action.payload,
      }      
  
    default:
      return state;
  }
}