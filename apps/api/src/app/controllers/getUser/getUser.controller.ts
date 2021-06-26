import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { GET_USER_CONTROLLER_STRING } from '@nx-bridge/constants';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetUserService } from './getUser.service';

@Controller(GET_USER_CONTROLLER_STRING)
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Post()
  async getData(
    @Body('username') username: string,
    @Body('email') email: string
  ): ControllerResponse<UserModel> {
    return await this.getUserService.getUser(username, email);
  }
}
