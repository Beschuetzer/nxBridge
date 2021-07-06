import { ErrorMessage } from './frontend-types';

export type ControllerResponse<T> = Promise< T | T[] | ErrorMessage >;

export interface Message {
  message: string;
}
