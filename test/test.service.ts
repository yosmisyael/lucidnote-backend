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

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        name: 'test',
        email: 'test@example.com',
        password: await bcrypt.hash('test', 10),
      },
    });
  }

  async createOtherUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test2',
        name: 'test2',
        email: 'test2@example.com',
        password: await bcrypt.hash('test', 10),
      },
    });
  }

  async deleteSession() {
    await this.prismaService.session.deleteMany();
  }

  async createAndLoginUser() {
    const user = await this.prismaService.user.create({
      data: {
        username: 'test',
        name: 'test',
        email: 'test@example.com',
        password: await bcrypt.hash('test', 10),
      },
    });
    await this.prismaService.session.create({
      data: {
        userId: user.id,
        token: 'test',
      },
    });
  }

  async createTag() {
    const user = await this.prismaService.user.findUnique({
      where: {
        username: 'test',
      },
    });

    await this.prismaService.tag.create({
      data: {
        name: 'example',
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
}
