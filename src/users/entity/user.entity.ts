import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { Role } from "src/auth/enums/rol.enum";
import { AutoMap } from "@automapper/classes";
import { DiemDanh } from "./rollcall.entity";
import { LopHoc } from "./class.entity";
import { ThongTinCaNhan } from "./profile.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @AutoMap()
    id: number;

    @Column()
    @AutoMap()
    loginName: string

    @Column()
    @AutoMap()
    fullName:string;

    @Column({ unique: true, nullable: false})
    @AutoMap()
    email: string;

    // @Column({unique: true, nullable: true})
    // phoneNumber: string;

    @Column({ nullable: false})
    @AutoMap()
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User,
      })
    @AutoMap()
    role: Role;

    @Column({ nullable: true })
    otp: string;

    @Column({ type: 'timestamp', nullable: true })
    otpExpires: Date;

    @OneToOne(() => ThongTinCaNhan, thongTinCaNhan => thongTinCaNhan.users)
    thongTinCaNhan: ThongTinCaNhan;

    @OneToMany(() => LopHoc, lopHoc => lopHoc.user)
    lopHocs: LopHoc[];

    @OneToMany(() => DiemDanh, diemDanh => diemDanh.users)
    diemDanhs: DiemDanh[];
}