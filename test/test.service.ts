import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {}

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: {
          contains: 'test',
        },
      },
    });
  }

  async createUser(name: string) {
    await this.prismaService.user.create({
      data: {
        username: name,
        name: name,
        email: `${name}@example.com`,
        password: await bcrypt.hash(name, 10),
      },
    });
  }

  async deleteSession() {
    await this.prismaService.session.deleteMany();
  }

  async createAndLoginUser(name: string) {
    const user = await this.prismaService.user.create({
      data: {
        username: name,
        name: name,
        email: `${name}@example.com`,
        password: await bcrypt.hash(`${test}`, 10),
      },
    });
    await this.prismaService.session.create({
      data: {
        userId: user.id,
        token: name,
      },
    });
  }

  async createTag(username: string, tagName: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        username,
      },
    });

    await this.prismaService.tag.create({
      data: {
        name: tagName,
        userId: user.id,
      },
    });
  }

  async getTag(name: string) {
    return this.prismaService.tag.findFirst({
      where: {
        name: name,
      },
    });
  }

  async deleteTag() {
    await this.prismaService.tag.deleteMany();
  }

  async createNote(
    username: string,
    title: string,
    body: string,
    tags: string[] | null = null,
  ) {
    let formattedTags: { id: string }[];
    const user = await this.prismaService.user.findUnique({
      where: {
        username: username,
      },
    });

    if (tags && tags.length > 0) {
      formattedTags = tags.map((id) => ({ id }));
    }
    await this.prismaService.note.create({
      data: {
        title,
        body,
        userId: user.id,
        tags: {
          connect: formattedTags,
        },
      },
    });
  }

  async getNote(title: string) {
    return this.prismaService.note.findFirst({
      where: {
        title,
      },
      include: {
        tags: true,
      },
    });
  }

  async deleteNote() {
    await this.prismaService.note.deleteMany();
  }
}
