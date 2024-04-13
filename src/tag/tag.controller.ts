import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TagService } from './tag.service';
import {
  CreateTagRequest,
  TagResponse,
  UpdateTagRequest,
} from '../model/tag.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';

@Controller('/api/tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateTagRequest,
  ): Promise<WebResponse<TagResponse>> {
    const result: TagResponse = await this.tagService.create(user, request);
    return {
      data: result,
    };
  }

  @Patch('/:tagId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateTagRequest,
    @Param('tagId') tagId: string,
  ): Promise<WebResponse<TagResponse>> {
    request.id = tagId;
    const result: TagResponse = await this.tagService.update(user, request);
    return {
      data: result,
    };
  }

  @Delete('/:tagId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('tagId') tagId: string,
  ): Promise<WebResponse<string>> {
    await this.tagService.remove(user, tagId);
    return {
      data: 'OK',
    };
  }

  @Get()
  @HttpCode(200)
  async getAll(@Auth() user: User): Promise<WebResponse<TagResponse[]>> {
    const result = await this.tagService.getAll(user);
    return {
      data: result,
    };
  }
}
