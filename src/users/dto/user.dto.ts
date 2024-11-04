// dto/user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/enums/rol.enum';

export class UserDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  loginName: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  role: Role;
}
