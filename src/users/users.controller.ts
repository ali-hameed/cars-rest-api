import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Session,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { AuthGuard } from '../guards/auth.guard';
import { User } from './user.entity';

@Controller('users')
@Serialize(UserDto)
@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Get('/auth/whoami')
  @UseGuards(AuthGuard)
  async getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('/auth/register')
  async registerUser(@Body() body: RegisterUserDto, @Session() session: any) {
    const user = await this.authService.register(
      body.email,
      body.full_name,
      body.password,
    );

    session.userId = user.id;
    return user;
  }

  @Post('/auth/login')
  async loginUser(@Body() body: LoginUserDto, @Session() session: any) {
    const user = await this.authService.login(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/auth/logout')
  logout(@Session() session: any) {
    session.userId = null;
    return 'logout success';
  }

  @Get()
  @UseGuards(AuthGuard)
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Get('/:id')
  async findOneUser(@Param('id') id: string) {
    console.log('Controller is running');
    const user = await this.userService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @Post()
  async createUser(@Body() body: RegisterUserDto) {
    let DBResponse: User;
    DBResponse = await this.userService.create(
      body.full_name,
      body.email,
      body.password,
    );
    return DBResponse;
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(parseInt(id), body);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }
}
