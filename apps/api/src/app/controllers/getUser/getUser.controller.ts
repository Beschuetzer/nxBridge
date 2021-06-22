import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetUserService } from './getUser.service';

@Controller('getId')
export class GetUserController {
  constructor(private readonly getUserService: GetUserService) {}

  @Post()
  async getData(
    @Body('name') name: string,
    @Body('email') email: string
  ): ControllerResponse<UserModel> {
    return await this.getUserService.getUser(name, email);
  }
}
