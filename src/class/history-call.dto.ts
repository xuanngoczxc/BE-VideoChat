import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class HistoryCallDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  classCode: string;
  
  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}
