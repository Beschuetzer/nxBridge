import { Body, Post, } from '@nestjs/common';
import { Controller, } from '@nestjs/common';
import { ErrorMessage, ObjectId } from '@nx-bridge/api-interfaces';
import { error1 as invalidEmailAndPassword } from '@nx-bridge/api-errors';
import { GetIdService } from './getId.service';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Post()
  getData(
    @Body('name') name: string,
    @Body('email') email: string,
  ): ObjectId | ErrorMessage {

    if (!email && ! name) {
      return { message: invalidEmailAndPassword, status: 400};
    }

    return `email: ${email} and name: ${name}` 
  }
}
