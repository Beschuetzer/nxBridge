import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse } from '@nx-bridge/interfaces-and-types';
import { GetIdService } from './getId.service';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Post()
  async getData(
    @Body('name') name: string,
    @Body('email') email: string
  ): ControllerResponse<UserModel> {
    return await this.getIdService.getId(name, email);
  }
}
