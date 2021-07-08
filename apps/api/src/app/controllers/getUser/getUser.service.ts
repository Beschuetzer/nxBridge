import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { INVALID_CREDENTIALS } from '@nx-bridge/api-errors';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import {
  ControllerResponse,
  ErrorMessage,
  GetUserResponse,
} from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root' })
export class GetUserService {
  constructor(@InjectModel('User') private userModel: Model<UserModel>) {}

  async getUser(
    username: string,
    email: string
  ): ControllerResponse<GetUserResponse | UserModel> {
    try {
      const error = this.validateInputs(username, email);
      if (error) return error;

      const response = (await this.queryDB(username, email)) as UserModel;
      if (response)
        return { id: (response as any)._id, username: response.username };
      return response;
      
    } catch (err) {
      return this.getErrorResponse();
    }
  }

  private validateInputs(username: string, email: string) {
    if (!email && !username) {
      return { message: INVALID_CREDENTIALS, status: 400 };
    }

    return null;
  }

  private async queryDB(
    username: string,
    email: string
  ): ControllerResponse<UserModel> {
    if (username) return await this.getUserFromUserName(username);
    else if (email) return await this.getUserFromEmail(email);
  }

  private async getUserFromUserName(username: string) {
    return await this.userModel.findOne({ username }).exec();
  }

  private async getUserFromEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  private getErrorResponse(): Promise<ErrorMessage> {
    return new Promise((res, rej) => {
      res({ message: 'Something went wrong in getUser()', status: 400 });
    });
  }
}
