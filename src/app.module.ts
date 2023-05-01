import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { Email } from './email/email.service';
import { AuthModule } from './auth/auth.module';
const configModule = ConfigModule.forRoot({
  isGlobal: true,
});

@Module({
  imports: [
    configModule,
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
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          auth: {
            user: config.get('NODEMAILER_EMAIL'),
            pass: config.get('NODEMAILER_PASS'),
          },
          tls: { rejectUnauthorized: false },
          secure: false,
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [Email],
})
export class AppModule {}
