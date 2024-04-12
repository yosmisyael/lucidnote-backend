import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ValidationService } from '../common/validation.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from '../common/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateTagRequest, TagResponse } from '../model/tag.model';
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
}
