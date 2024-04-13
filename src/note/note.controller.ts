import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
    @Param('noteId') noteId: string,
  ): Promise<WebResponse<NoteResponse>> {
    const response = await this.noteService.get(user, noteId);
    return {
      data: response,
    };
  }

  @Patch('/:noteId')
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Body() request: UpdateNoteRequest,
    @Param('noteId') noteId: string,
  ): Promise<WebResponse<NoteResponse>> {
    request.id = noteId;
    const response = await this.noteService.update(user, request);
    return {
      data: response,
    };
  }

  @Delete('/:noteId')
  @HttpCode(200)
  async remove(
    @Auth() user: User,
    @Param('noteId') noteId: string,
  ): Promise<WebResponse<string>> {
    await this.noteService.remove(user, noteId);
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
