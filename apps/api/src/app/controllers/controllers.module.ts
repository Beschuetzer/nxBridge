import { HttpClient } from '@angular/common/http';
import { Module } from '@nestjs/common';
import { GetIdController } from './getId/getId.controller';
import { GetIdService } from './getId/getId.service';

@Module({
  imports: [],
  controllers: [GetIdController],
  providers: [GetIdService, HttpClient],
})
export class ControllersModule {

}
