import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";

export class RegisterUserDto {

    @IsNotEmpty()
    @AutoMap()
    readonly loginName: string;
    
    @IsNotEmpty()
    @AutoMap()
    readonly fullName: string;

    @IsNotEmpty()
    @AutoMap()
    readonly email: string;

    @IsNotEmpty()
    @AutoMap()
    readonly password: string;

    @IsNotEmpty()
    @AutoMap()
    readonly rePassword: string;

}