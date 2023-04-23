import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'Admin_Wallets',
      password: '488661632',
      database: 'blogs',
      autoLoadEntities: true,
      synchronize: true,
      entities: ['src/*.entity.ts'],
    }),

    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
