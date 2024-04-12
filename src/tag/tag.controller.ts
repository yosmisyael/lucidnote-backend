import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagRequest, TagResponse } from '../model/tag.model';
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
    const result = await this.tagService.create(user, request);
    return {
      data: result,
    };
  }
}
