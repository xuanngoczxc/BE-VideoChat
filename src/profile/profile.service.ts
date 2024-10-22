import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/users/entity/user.entity";
import { CreateProfile } from "./dto/profile.dto";
import { InjectMapper } from "@automapper/nestjs";
import { Mapper } from "@automapper/core";
import { ThongTinCaNhan } from "./profile.entity";

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(ThongTinCaNhan)
        private readonly profileRepository: Repository<ThongTinCaNhan>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectMapper()
        private readonly mapper: Mapper
    ) {}

    async create(createPhotoDto: CreateProfile): Promise<ThongTinCaNhan> {
        const photo = this.mapper.map(createPhotoDto, CreateProfile, ThongTinCaNhan)

        const user = await this.userRepository.findOne({
          where: { id: createPhotoDto.userId }
        });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        photo.users = user;
        return this.profileRepository.save(photo);
    }

    findAll(): Promise<ThongTinCaNhan[]> {
        return this.profileRepository.find({ relations: ['user'] });
    }
    
    findOne(id: number): Promise<ThongTinCaNhan> {
        return this.profileRepository.findOne({ 
            where: { },
            relations: ['user'] 
        });
    }
    
    async remove(id: number): Promise<void> {
        await this.profileRepository.delete(id);
    }
}