import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { INVALID_USERS_ARRAY } from '@nx-bridge/api-errors';
import { ControllerResponse, ErrorMessage, User } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';
import {getMongooseObjsFromStrings} from '@nx-bridge/constants';

@Injectable({ providedIn: 'root'})
export class GetUsersService {

  constructor(
    @InjectModel('User') private userModel: Model<User>,
  ) {}

  async getUsers(users): ControllerResponse<User | {[key:string]: string}> {
    try {
      const error = this.validateInputs(users);
      if (error) return error;
      return await this.queryDB(users);
    } catch(err) {
      console.log('err =', err);
      this.getErrorResponse();
    }

  }

  private validateInputs(users: string[]) {
    if (!users || users.length < 0) {
      return { message: INVALID_USERS_ARRAY, status: 400 };
    }

    return null;
  }

  private async queryDB(users: string[]): ControllerResponse<User | {[key:string]: string}> {
    const mongooseObjs = getMongooseObjsFromStrings(users);
    const response = await this.userModel.find({_id: {$in: mongooseObjs}});
    // const newResponse = response.map(userObj => {return {...(userObj as any)._doc, salt: null, hash: null, email: null, resetPasswordToken: null} as User})
    return response.map(userObj =>  { 
      return {[userObj._id]: userObj.username};
    });
  }

  private getErrorResponse(): Promise<ErrorMessage> {
    return new Promise((res, rej) => {
      res({ message: 'Error in getUsers()', status: 400 });
    });
  }
}
