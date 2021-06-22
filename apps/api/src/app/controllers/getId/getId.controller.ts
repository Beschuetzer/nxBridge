import { Body, Post } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { UserModel } from '@nx-bridge/api-mongoose-models';
import { ControllerResponse, ErrorMessage } from '@nx-bridge/interfaces-and-types';
import { GetIdService } from './getId.service';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Post()
  getData(
    @Body('name') name: string,
    @Body('email') email: string
  ): Promise<UserModel | ErrorMessage > {
    console.log('name =', name);
    console.log('email =', email);
    return this.getIdService.getId(name, email);
  }
}
