import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";

export class CreateProfile {
    @IsNotEmpty()
    @AutoMap()
    readonly url: string;

    @IsNotEmpty()
    @AutoMap()
    readonly userId: number;
}