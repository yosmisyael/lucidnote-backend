import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private prismaService: PrismaService) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    const token: string = req.headers['authorization'] as string;
    if (token) {
      const user = await this.prismaService.session.findFirst({
        where: {
          token: token,
        },
        include: {
          user: true,
        },
      });

      if (user) {
        req.user = user.user;
      }
    }
    next();
  }
}
