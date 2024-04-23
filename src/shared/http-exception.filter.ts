import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as requestIp from 'request-ip';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    console.error(`
    IP: ${requestIp.getClientIp(request)}
    IP-XFF: ${request.headers['x-forwarded-for']}
    Endpoint: ${request.url}
    Method: ${request.method}
    Error: ${exception.message}
    Body: ${JSON.stringify(response.req.body) ?? 'No body'}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
