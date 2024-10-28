import { AutoMap } from "@automapper/classes";
import { IsEnum, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "src/auth/enums/rol.enum";

export class CreateUserDto {
    
    @ApiProperty() // Chỉ hiển thị tên trường "name"
    @IsNotEmpty()
    @AutoMap()
    readonly name: string;

    @ApiProperty() // Chỉ hiển thị tên trường "email"
    @IsNotEmpty()
    @AutoMap()
    readonly email: string;

    @ApiProperty() // Chỉ hiển thị tên trường "password"
    @IsNotEmpty()
    @AutoMap()
    readonly password: string;

    @ApiProperty({ enum: Role }) // Hiển thị tên trường "role" mà không có ví dụ, chỉ cần liệt kê các giá trị enum
    @IsNotEmpty()
    @AutoMap()
    @IsEnum(Role, { message: 'Vai trò không hợp lệ, các giá trị cho phép: Admin, User' })
    readonly role: Role;
}
