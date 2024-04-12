import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        error: exception.getResponse(),
      });
    } else if (exception instanceof ZodError) {
      response.status(400).json({
        error: exception.message,
      });
    } else {
      response.status(500).json({
        error: exception.message(),
      });
    }
  }
}
