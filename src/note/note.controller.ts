import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { NoteService } from './note.service';
import { WebResponse } from '../model/web.model';
import {
  CreateNoteRequest,
  NoteResponse,
  SearchNoteRequest,
  UpdateNoteRequest,
} from '../model/note.model';
import { Auth } from '../common/auth.decorator';
import { User } from '@prisma/client';
import { Request } from 'express';

@Controller('/api/notes')
export class NoteController {
  constructor(private noteService: NoteService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateNoteRequest,
  ): Promise<WebResponse<NoteResponse>> {
    const response = await this.noteService.create(user, request);
    return {
      data: response,
    };
  }

  @Get('/:noteId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Req() httpReq: Request,
  ): Promise<WebResponse<NoteResponse>> {
    const response = await this.noteService.get(user, httpReq.params.noteId);
    return {
      data: response,
    };
  }

  @Patch('/:noteId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateNoteRequest,
    @Req() httpReq: Request,
  ): Promise<WebResponse<NoteResponse>> {
    request.id = httpReq.params.noteId;
    const response = await this.noteService.update(user, request);
    return {
      data: response,
    };
  }

  @Delete('/:noteId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Req() httpReq: Request,
  ): Promise<WebResponse<string>> {
    await this.noteService.remove(user, httpReq.params.noteId);
    return {
      data: 'OK',
    };
  }

  @Get()
  @HttpCode(200)
  async search(
    @Auth() user: User,
    @Query('title') title?: string,
    @Query('tags') tags?: string[],
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<NoteResponse[]>> {
    const request: SearchNoteRequest = {
      title,
      tags,
      page: page || 1,
      size: size || 10,
    };
    return this.noteService.search(user, request);
  }
}
