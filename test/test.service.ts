import { PrismaService } from '../src/common/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  constructor(private prismaService: PrismaService) {
  }

  async deleteUser() {
    await this.prismaService.user.deleteMany({
      where: {
        username: 'test',
      },
    });
  }

  async createUser() {
    await this.prismaService.user.create({
      data: {
        username: 'test',
        name: 'test',
        email: 'test@example.com',
        password: 'test',
      },
    });
  }
}
