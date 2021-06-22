import { GameModel } from '@nx-bridge/api-mongoose-models';
import { ErrorMessage } from '@nx-bridge/interfaces-and-types';

export type ControllerResponse =
  | Promise<GameModel | ErrorMessage>
  | ErrorMessage;

export interface Message {
  message: string;
}
