import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { GET_USERS_CONTROLLER_STRING, USERS_STRING } from '@nx-bridge/constants';
import { ControllerResponse, User } from '@nx-bridge/interfaces-and-types';
import { GetUsersService } from './getUsers.service';

@Controller(GET_USERS_CONTROLLER_STRING)
export class GetUsersController {
  constructor(private getUsersService: GetUsersService) {}

  @Post()
  async getData(
    @Body(USERS_STRING) users: string[],
  ): ControllerResponse<User> {
    return await this.getUsersService.getUsers(users);
  }
}
