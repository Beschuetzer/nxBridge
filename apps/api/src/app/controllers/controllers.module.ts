import { HttpClient } from '@angular/common/http';
import { Module } from '@nestjs/common';
import { GetIdController } from './getId/getId.controller';
import { GetIdService } from './getId/getId.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [GetIdController],
  providers: [GetIdService, HttpClient],
})
export class ControllersModule {

}
