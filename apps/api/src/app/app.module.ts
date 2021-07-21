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
      `mongodb+srv://${process.env.mongoDB_USER}:${process.env.mongoDB_PASSWORD}@cluster0.3trbv.mongodb.net/Bridge?retryWrites=true&w=majority`,
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
