import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LopHoc } from './class.entity';
import { User } from './user.entity';

@Entity()
export class DiemDanh {
  @PrimaryGeneratedColumn()
  IDDiemDanh: number;

  @Column()
  HoTen: string;

  @Column()
  TenDangNhap: string;

  @Column()
  Ngay: Date;

  @Column()
  DiHoc: string;

  @Column()
  MaLop: string;

  @ManyToOne(() => LopHoc, lopHoc => lopHoc.diemDanhs)
  @JoinColumn({ name: 'MaLop' })
  lopHoc: LopHoc;

  @ManyToOne(() => User, users => users.diemDanhs)
  @JoinColumn({ name: 'TenDangNhap' })
  users: User;
}