import { AutoMap } from "@automapper/classes";
import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "src/auth/enums/rol.enum";

export class CreateUserDto {
    
    @IsNotEmpty()
    @AutoMap()
    readonly name: string;

    @IsNotEmpty()
    @AutoMap()
    readonly email: string;

    @IsNotEmpty()
    @AutoMap()
    readonly password: string;

    @IsNotEmpty()
    @AutoMap()
    @IsEnum(Role, { message: ''})
    readonly role: Role;
}