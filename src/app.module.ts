import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { UserModule } from './user/user.module';
import { TagModule } from './tag/tag.module';
import { NoteModule } from './note/note.module';

@Module({
  imports: [CommonModule, UserModule, TagModule, NoteModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
