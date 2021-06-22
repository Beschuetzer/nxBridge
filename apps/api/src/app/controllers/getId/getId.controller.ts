import { Body, Post, } from '@nestjs/common';
import { Controller, } from '@nestjs/common';
import { ErrorMessage, UserId } from '@nx-bridge/api-interfaces';
import { error1 } from '@nx-bridge/api-errors';
import { GetIdService } from './getId.service';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Post()
  getData(
    @Body('name') name: string,
    @Body('email') email: string,
  ): UserId | ErrorMessage {

    if (!email && ! name) {
      //TODO: create an error message item/module and store errors there
      return { message: error1, status: 400};
    }

    return `email: ${email} and name: ${name}` 
  }
}
