import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { Prisma, Tag, User } from '@prisma/client';
import {
  CreateTagRequest,
  TagResponse,
  UpdateTagRequest,
} from '../model/tag.model';
import { TagValidation } from './tag.validation';

@Injectable()
export class TagService {
  constructor(
    private validationService: ValidationService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private prismaService: PrismaService,
  ) {}

  async verifyUniqueness(
    userId: string,
    name: string,
    tagId?: string,
  ): Promise<boolean> {
    const whereClause: Prisma.TagWhereInput = {
      userId,
      name,
    };

    if (tagId) {
      whereClause.NOT = { id: tagId };
    }

    const countTags = await this.prismaService.tag.count({
      where: whereClause,
    });

    return countTags === 0;
  }

  async verifyTag(userId: string, tagId: string): Promise<Tag> {
    const tag = await this.prismaService.tag.findUnique({
      where: {
        id: tagId,
        userId: userId,
      },
    });

    if (!tag) {
      throw new HttpException('Tag does not exist.', 404);
    }

    return tag;
  }

  async create(user: User, request: CreateTagRequest): Promise<TagResponse> {
    this.logger.info(`[TAG CREATE]: ${JSON.stringify(request)}`);
    const createRequest: CreateTagRequest = this.validationService.validate(
      TagValidation.CREATE,
      request,
    );
    const isAvailable: boolean = await this.verifyUniqueness(
      user.id,
      createRequest.name,
    );

    if (!isAvailable) {
      throw new HttpException('Tag name is already taken.', 400);
    }

    const preparedData = {
      ...createRequest,
      ...{ userId: user.id },
    };

    const tag = await this.prismaService.tag.create({
      data: preparedData,
    });

    return {
      id: tag.id,
      name: tag.name,
    };
  }

  async update(user: User, request: UpdateTagRequest): Promise<TagResponse> {
    this.logger.info(`[TAG UPDATE]: ${JSON.stringify(request)}`);
    const updateRequest: UpdateTagRequest = this.validationService.validate(
      TagValidation.UPDATE,
      request,
    );
    const isAvailable: boolean = await this.verifyUniqueness(
      user.id,
      updateRequest.name,
      updateRequest.id,
    );

    if (!isAvailable) {
      throw new HttpException('Tag name is already taken.', 400);
    }

    await this.verifyTag(user.id, updateRequest.id);

    const tag = await this.prismaService.tag.update({
      where: {
        id: updateRequest.id,
        userId: user.id,
      },
      data: updateRequest,
    });

    return {
      id: tag.id,
      name: tag.name,
    };
  }

  async remove(user: User, tagId: string): Promise<boolean> {
    await this.verifyTag(user.id, tagId);
    await this.prismaService.tag.delete({
      where: {
        userId: user.id,
        id: tagId,
      },
    });

    return true;
  }

  async getAll(user: User): Promise<TagResponse[]> {
    return this.prismaService.tag.findMany({
      where: {
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
