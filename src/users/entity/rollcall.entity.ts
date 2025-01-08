import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LopHoc } from './class.entity';
import { User } from './user.entity';

@Entity()
export class DiemDanh {
  @PrimaryGeneratedColumn()
  IDDiemDanh: number;

  @Column()
  HoTen: string;

  @Column({ nullable: true })
  TenDangNhap: string;

  @ManyToOne(() => User, users => users.diemDanhs)
  @JoinColumn({ name: 'TenDangNhap', referencedColumnName: 'loginName' })
  users: User;

  @Column({ nullable: true })
  Ngay: Date;

  @Column({ nullable: true })
  DiHoc: string;

  @Column({ nullable: true })
  MaLop: string;

  @ManyToOne(() => LopHoc, lopHoc => lopHoc.diemDanhs)
  @JoinColumn({ name: 'MaLop', referencedColumnName: 'MaLop' })
  lopHoc: LopHoc;
}