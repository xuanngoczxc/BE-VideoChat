import { createMap, Mapper, MappingProfile } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../dto/create-user.dto";
import { User } from "../entity/user.entity";
import { UpdateUserDto } from "../dto/update-user.dto";
import { map } from "rxjs";
import { RegisterUserDto } from "../dto/register-user.dto";
import { LoginDto } from "src/auth/dto/login.dto";

@Injectable()
export class UserProfile extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile(): MappingProfile {
        return (mapper) => {
            createMap(mapper, CreateUserDto, User);
            //createMap(mapper, User, CreateUserDto);
            createMap(mapper, UpdateUserDto, User);
            // createMap(mapper, User, UpdateUserDto);
            createMap(mapper, RegisterUserDto, User)
            createMap(mapper, RegisterUserDto, User)
            createMap(mapper, LoginDto, User)
            // createMap(mapper, CreatePhotoDto, Photo)
        }
    }
}