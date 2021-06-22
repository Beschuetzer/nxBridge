import { Injectable } from '@angular/core';
import { InjectModel } from '@nestjs/mongoose';
import { invalidEmailAndPassword } from '@nx-bridge/api-errors';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ErrorMessage } from '@nx-bridge/interfaces-and-types';
import { Model } from 'mongoose';

@Injectable({ providedIn: 'root'})
export class GetIdService {
  constructor(
    @InjectModel('User') private userModel: Model<UserModel>,
  ) {}

  async getId(username: string, email: string): Promise<UserModel | ErrorMessage > {
    const error = this.validateInputs(username, email);
    console.log('error =', error);
    if (error) return error;
    return this.queryDB(username, email);
  }

  private validateInputs(username: string, email: string) {
    if (!email && !username) {
      return { message: invalidEmailAndPassword, status: 400 };
    }

    return null;
  }

  private async queryDB(username: string, email: string) {
    if (username) return await this.getIdFromUserName(username);
    else if (email) return await this.getIdFromEmail(email);
  }

  private async getIdFromUserName(username: string) {
    console.log('username =', username);
    const response =  await this.userModel.findOne({username}).exec();
    console.log('response =', response);
    return response;
  }

  private async getIdFromEmail(email: string) {
    return await this.userModel.findOne({email});
  }
}
