import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ControllerResponse, User } from '@nx-bridge/interfaces-and-types';
import { GetUsersService } from './getUsers.service';

@Controller('getUsers')
export class GetUsersController {
  constructor(private getUsersService: GetUsersService) {}

  @Post()
  async getData(
    @Body('users') users: string[],
  ): ControllerResponse<User> {
    return await this.getUsersService.getUsers(users);
  }
}
