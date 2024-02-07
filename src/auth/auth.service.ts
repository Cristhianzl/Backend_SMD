import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(username, pass) {
    const user = await this.usersService.findOneEmail(username);
    const currentUser = user?.rows[0];

    if (!currentUser) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, currentUser?.password);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const userData = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      username: currentUser.username,
      tenant: currentUser.tenant_name,
    };

    const payload = {
      sub: currentUser.id,
      username: currentUser.username,
      tenantName: currentUser.tenant_name,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
      userData,
    };
  }

  async checkJwt(token) {
    const health = await this.jwtService.verifyAsync(token.access_token);
    const expirationDate = new Date(health.exp * 1000);
    const now = new Date();
    if (expirationDate < now) {
      throw new UnauthorizedException();
    }

    return health;
  }

  async getUser(body) {
    const user = await this.usersService.findOneById(body.id);
    const currentUser = user?.rows[0];
    if (!currentUser) {
      throw new UnauthorizedException();
    }

    const userData = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      username: currentUser.username,
    };

    return userData;
  }

  async renewAccessToken(token) {
    const health = await this.jwtService.verifyAsync(token.refresh_token);

    const user = await this.usersService.findOne(health.username);
    const currentUser = user?.rows[0];

    if (!currentUser) {
      throw new UnauthorizedException();
    }

    const payload = {
      sub: currentUser.id,
      username: currentUser.username,
      tenantName: currentUser.tenant_name,
    };
    return {
      access_token: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      refresh_token: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
      }),
    };
  }
}
