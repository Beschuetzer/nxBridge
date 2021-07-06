import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { GET_USER_CONTROLLER_STRING, USERNAME_STRING, EMAIL_STRING } from '@nx-bridge/constants';
import { ControllerResponse, GetUserResponse } from '@nx-bridge/interfaces-and-types';
import { GetUserService } from './getUser.service';

@Controller(GET_USER_CONTROLLER_STRING)
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Post()
  async getData(
    @Body(USERNAME_STRING) username: string,
    @Body(EMAIL_STRING) email: string
  ): ControllerResponse<GetUserResponse | UserModel> {
    return await this.getUserService.getUser(username, email);
  }
}
