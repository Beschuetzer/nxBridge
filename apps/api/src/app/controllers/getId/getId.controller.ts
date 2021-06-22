import { Controller, Post, Body } from '@nestjs/common';
import { UserId } from '@nx-bridge/api-interfaces';
import { GetIdService } from './getId.service';
import { invalidNameAndEmail } from '@nx-bridge/api-interfaces';

@Controller('getId')
export class GetIdController {
  constructor(private readonly getIdService: GetIdService) {}

  @Post()
  getData(
    @Body('name') name: string,
    @Body('email') email: string,
  ): any {

    if (!email && !name) {
      //TODO: create an error message item/module and store errors there
      return {message: invalidNameAndEmail, status: 400}
    }

    return `email: ${email} and name: ${name}` 
  }
}
