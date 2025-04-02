import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { keycloakResponse, LoginDto, LoginResponse } from './dto/login.dto';
import { ClsService } from 'nestjs-cls';
import * as jwt from 'jsonwebtoken';
import { decode } from 'punycode';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly clsService: ClsService,
    private readonly httpService: HttpService,
  ) {}

  async register(user: RegisterDto) {
    try {
      const adminToken = await this.getAdminToken();
      const response = await firstValueFrom(this.httpService.post<any>(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/users`,
        {
          username: user.username,
          email: user.email,
          enabled: true,
          credentials: [
            {
              type: 'password',
              value: user.password,
              temporary: false,
            },
          ],          
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        },
      ).pipe(catchError((error) => {throw error}))
    );
    

      return { success: true, message: 'Usuário registrado com sucesso' };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao registrar usuário',
        error: error.response?.data || error.message,
      };
    }
  }

  async login(credentials: LoginDto):Promise<LoginResponse|any> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<keycloakResponse>(
          `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
          new URLSearchParams({
            client_id: process.env.KEYCLOAK_CLIENT_ID || '',
            client_secret: process.env.KEYCLOAK_SECRET || '',
            grant_type: 'password',
            username: credentials.username,
            password: credentials.password,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ).pipe(catchError((error) => {throw error})),
      );

      const decoded = jwt.decode(data.access_token) as any;
      this.clsService.set('user', {
        decoded,
        resource_access: decoded.resource_access,
      });

      return {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Credenciais inválidas',
        error: error.response?.data || error.message,
      };
    }
  }

  async refreshToken(token: string) {
    try {
      const {data} = await firstValueFrom(this.httpService.post<keycloakResponse>(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID || '',
          client_secret: process.env.KEYCLOAK_SECRET || '',
          grant_type: 'refresh_token',
          refresh_token: token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ).pipe(catchError((error) => {throw error})));
      console.log(data)

      return {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao atualizar token',
        error: error.response?.data || error.message,
      };
    }
  }

  async logout(token: string) {
    try {
      await this.httpService.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/logout`,
        new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID || '',
          client_secret: process.env.KEYCLOAK_SECRET || '',
          refresh_token: token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true,
        },
      );

      this.clsService.get('user');
      this.clsService.set('user', undefined);

      return { success: true, message: 'Logout realizado com sucesso' };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao fazer logout',
        error: error.response?.data || error.message,
      };
    }
  }

  private async getAdminToken() {
    try {
      const response = await this.httpService.post(
        `${process.env.KEYCLOAK_AUTH_SERVER_URL}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          client_id: 'admin-cli',
          username: process.env.KEYCLOAK_ADMIN || '',
          password: process.env.KEYCLOAK_ADMIN_PASSWORD || '',
          grant_type: 'password',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return 'response.data.access_token';
    } catch (error) {
      throw new Error(`Erro ao obter token de admin: ${error.message}`);
    }
  }
}


