import { Body, Controller, HttpCode, Patch, Post, Req } from '@nestjs/common';
import { TagService } from './tag.service';
import {
  CreateTagRequest,
  TagResponse,
  UpdateTagRequest,
} from '../model/tag.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { Request } from 'express';

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
    @Req() httpReq: Request,
  ): Promise<WebResponse<TagResponse>> {
    request.id = httpReq.params.tagId;
    const result: TagResponse = await this.tagService.update(user, request);
    return {
      data: result,
    };
  }
}
