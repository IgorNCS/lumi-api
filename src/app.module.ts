import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KeycloakModule } from './keycloak/keycloak.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    AuthModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      interceptor: { mount: false },
    }),
    ConfigModule.forRoot({
    isGlobal: true,
  }),
    KeycloakModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
