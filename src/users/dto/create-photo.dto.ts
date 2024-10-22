import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";

export class CreatePhotoDto {
    @IsNotEmpty()
    @AutoMap()
    readonly url: string;

    @IsNotEmpty()
    @AutoMap()
    readonly userId: number;
}