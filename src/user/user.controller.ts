import {
  Body,
  Controller,
  Post,
  HttpCode,
  Get,
  Patch,
  Delete,
  Req,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { WebResponse } from '../model/web.model';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Controller('/api/users')
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Post()
  @HttpCode(200)
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.register(request);
    return {
      data: result,
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(
    @Body() request: LoginUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.login(request);
    return {
      data: result,
    };
  }

  @Get('/current')
  @HttpCode(200)
  async get(@Auth() user: User): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(user);
    return {
      data: result,
    };
  }

  @Patch('/current')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/logout')
  @HttpCode(200)
  async delete(
    @Auth() user: User,
    @Req() request: Request,
  ): Promise<WebResponse<string>> {
    const token = request.headers['authorization'];
    await this.userService.logout(token);
    return {
      data: 'OK',
    };
  }
}
