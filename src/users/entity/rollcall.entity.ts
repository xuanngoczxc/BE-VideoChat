import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LopHoc } from './class.entity';
import { User } from './user.entity';

@Entity()
export class DiemDanh {
  @PrimaryGeneratedColumn()
  IDDiemDanh: number;

  @Column()
  ThoiGianVao: Date;

  @Column()
  ThoiGianRa: Date;

  @Column()
  DiHoc: boolean;

  @ManyToOne(() => LopHoc, lopHoc => lopHoc.diemDanhs)
  @JoinColumn({ name: 'IDLop' })
  lopHoc: LopHoc;

  @ManyToOne(() => User, users => users.diemDanhs)
  @JoinColumn({ name: 'TenDangNhap' })
  users: User;
}