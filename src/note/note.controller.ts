import { Body, Controller, Get, HttpCode, Post, Req } from '@nestjs/common';
import { NoteService } from './note.service';
import { WebResponse } from '../model/web.model';
import { CreateNoteRequest, NoteResponse } from '../model/note.model';
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
}
