import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetUserService } from './getUser.service';

@Controller('getUser')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Post()
  async getData(
    @Body('username') username: string,
    @Body('email') email: string
  ): ControllerResponse<UserModel> {
    console.log('username =', username);
    console.log('email =', email);
    return await this.getUserService.getUser(username, email);
  }
}
