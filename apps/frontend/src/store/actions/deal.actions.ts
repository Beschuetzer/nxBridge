import { Action } from '@ngrx/store';

export const LOGIN = '[Auth] LOGIN';

export class Login implements Action {
  readonly type = LOGIN;
  constructor(
    public payload: {
      email: string;
      userId: string;
      token: string;
      expirationDate: Date;
    }
  ) {}
}

export type Actions = Login;
