import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { DiemDanh } from './rollcall.entity';
import { LichSuCuocGoi } from './history.entity';

@Entity()
export class LopHoc {
  @PrimaryGeneratedColumn()
  IDLop: number;

  @Column()
  ThoiGianTao: Date;

  @Column()
  Quyen: string;

  @ManyToOne(() => User, users => users.lopHocs)
  @JoinColumn({ name: 'TenDangNhap' })
  users: User;

  @OneToMany(() => DiemDanh, diemDanh => diemDanh.lopHoc)
  diemDanhs: DiemDanh[];

  @OneToMany(() => LichSuCuocGoi, lichSuCuocGoi => lichSuCuocGoi.lopHoc)
  lichSuCuocGois: LichSuCuocGoi[];
}