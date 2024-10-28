import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { CreateProfile } from "./dto/profile.dto";
import { ApiTags } from "@nestjs/swagger";
@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(@Body() createProfile: CreateProfile) {
    return this.profileService.create(createProfile);
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}