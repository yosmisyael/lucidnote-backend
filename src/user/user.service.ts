import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async verifyUniqueUsername(
    username: string,
    userId?: string,
  ): Promise<boolean> {
    const whereClause: Prisma.UserWhereInput = {
      username,
    };

    if (userId) {
      whereClause.NOT = { id: userId };
    }

    const countUsernames = await this.prismaService.user.count({
      where: whereClause,
    });

    return countUsernames === 0;
  }

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.info(`[REGISTER] ${JSON.stringify(request)}`);
    const registerRequest = this.validationService.validate(
      UserValidation.REGISTER,
      request,
    );

    const isAvailable: boolean = await this.verifyUniqueUsername(
      registerRequest.username,
    );

    if (!isAvailable) {
      throw new HttpException('Username is already taken.', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.info(`[LOGIN] ${JSON.stringify(request)}`);
    const loginRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    const user = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!user) {
      throw new HttpException('Username or password is wrong.', 401);
    }

    const passwordValidation = await bcrypt.compare(
      loginRequest.password,
      user.password,
    );

    if (!passwordValidation) {
      throw new HttpException('Username or password is wrong.', 401);
    }

    const token = uuid();

    await this.prismaService.session.create({
      data: {
        userId: user.id,
        token,
      },
    });

    return {
      name: user.name,
      username: user.username,
      token: token,
    };
  }
}
