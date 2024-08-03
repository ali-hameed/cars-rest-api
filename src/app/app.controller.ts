import { Controller, Get, Post, Req } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  getHello() {
    return 'Hello World!';
  }
}
