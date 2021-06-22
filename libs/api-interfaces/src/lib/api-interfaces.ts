export interface Message {
  message: string;
}

export type UserId = string;

export interface ErrorMessage {
  message: string, 
  status: number,
}