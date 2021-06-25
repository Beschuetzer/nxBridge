import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { invalidUsersArray } from '@nx-bridge/api-errors';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';
import {getMongooseObjsFromStrings} from '@nx-bridge/constants';

@Injectable({ providedIn: 'root'})
export class GetUsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserModel>,
  ) {}

  async getUsers(users): ControllerResponse<UserModel> {
    const error = this.validateInputs(users);
    if (error) return error;
    return await this.queryDB(users);
  }

  private validateInputs(users: string[]) {
    if (!users || users.length < 0) {
      return { message: invalidUsersArray, status: 400 };
    }

    return null;
  }

  private async queryDB(users: string[]): ControllerResponse<UserModel> {
    const mongooseObjs = getMongooseObjsFromStrings(users);
    console.log('mongooseObjs =', mongooseObjs);
    return await this.userModel.find({_id: {$in: mongooseObjs}});
  }

}
