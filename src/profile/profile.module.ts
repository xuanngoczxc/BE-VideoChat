import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThongTinCaNhan } from "./profile.entity";
import { User } from "src/users/entity/user.entity";
import { ProfileService } from "./profile.service";
import { ProfileController } from "./profile.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ThongTinCaNhan, User])],
    providers: [ProfileService],
    controllers: [ProfileController],
})
export class ProfileModule{}