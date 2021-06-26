import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { invalidUsersArray } from '@nx-bridge/api-errors';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse, User } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';
import {getMongooseObjsFromStrings} from '@nx-bridge/constants';

@Injectable({ providedIn: 'root'})
export class GetUsersService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async getUsers(users): ControllerResponse<User> {
    const error = this.validateInputs(users);
    if (error) return error;
    console.log('queryDB------------------------------------------------');
    return await this.queryDB(users);
  }

  private validateInputs(users: string[]) {
    if (!users || users.length < 0) {
      return { message: invalidUsersArray, status: 400 };
    }

    return null;
  }

  private async queryDB(users: string[]): ControllerResponse<User> {
    const mongooseObjs = getMongooseObjsFromStrings(users);
    const response = await this.userModel.find({_id: {$in: mongooseObjs}});
    const newResponse = response.map(userObj => {return {...(userObj as any)._doc, salt: null, hash: null, email: null, resetPasswordToken: null} as User})
    return newResponse;
  }

}
