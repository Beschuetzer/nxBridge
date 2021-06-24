import { ErrorMessage } from '@nx-bridge/interfaces-and-types';

export type ControllerResponse<T> = Promise< T | T[] | ErrorMessage >;

export interface Message {
  message: string;
}
