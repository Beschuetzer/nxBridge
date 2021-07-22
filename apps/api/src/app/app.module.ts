import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllersModule } from './controllers/controllers.module';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { ServeStaticModule } from '@nestjs/serve-static'; // <- INSERT LINE
import { join } from 'path'; // <- INSERT LINE
dotenv.config();

@Module({
  imports: [
    ControllersModule,
    MongooseModule.forRoot(
      process.env.mongoDB_URI,
      {'useCreateIndex': true}
    ),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend'),
      exclude: ['/api*']
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
