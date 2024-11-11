import { Body, Controller, Delete, Get, NotFoundException, Param, ParseArrayPipe, ParseIntPipe, Patch, Post, Put, Query, Req, Search, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { User } from "./entity/user.entity";
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/rol.enum";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { InjectMapper, MapInterceptor } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { UserDto } from "./dto/user.dto";
import { UpdateProfileDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UsersService,
        @InjectMapper() private readonly mapper: Mapper
    ){}

    @Get('list')
    async getAllUsersWithProfile(): Promise<User[]> {
        return await this.userService.findAllWithProfile();
    }

    @Get(':id')
    async getUserProfile(@Param('id', ParseIntPipe) id: number): Promise<UserDto> {
        return await this.userService.findOneById(id);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto)
    }

    @Get('pagination')
    async searchPaginated(
        @Query() query: PaginationDto
    ): Promise<{ users: User[]; total: number; totalPages: number; currentPage: number }> {
        return this.userService.findAllPaginated(query);
    }
}