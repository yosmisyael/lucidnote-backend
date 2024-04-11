import { HttpException, Inject, Injectable } from '@nestjs/common';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { UserValidation } from './user.validation';
import { Prisma, User } from '@prisma/client';
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

  async get(user: User): Promise<UserResponse> {
    return {
      username: user.username,
      name: user.name,
    };
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.info(`[UPDATE] ${JSON.stringify(request)}`);
    const updateRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }

    if (updateRequest.username) {
      const isAvailable: boolean = await this.verifyUniqueUsername(
        updateRequest.username,
        user.id,
      );

      if (!isAvailable) {
        throw new HttpException('Username is already taken.', 400);
      }

      user.username = updateRequest.username;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    return {
      username: result.username,
      name: result.name,
    };
  }
}
