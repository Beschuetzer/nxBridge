import { Query } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
import { Message, UserId } from '@nx-bridge/api-interfaces';
import { GetIdService } from './getId.service';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Get()
  getData(
    @Query('name') name: string,
    @Query('email') email: string,
  ): UserId {

    if (!email && ! name) {
      //TODO: create an error message item/module and store errors there
    }

    return `email: ${email} and name: ${name}` 
  }
}
