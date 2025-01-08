import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { DiemDanh } from './rollcall.entity';
import { LichSuCuocGoi } from './history.entity';

@Entity()
export class LopHoc {
  @PrimaryGeneratedColumn()
  IDLop: number;

  @Column({ length: 6, unique: true })
  MaLop: string

  @Column()
  ThoiGianTao: Date;

  @Column()
  Quyen: string;

  @ManyToOne(() => User, user => user.lopHocs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => DiemDanh, diemDanh => diemDanh.lopHoc)
  diemDanhs: DiemDanh[];

  @OneToOne(() => LichSuCuocGoi, lichSuCuocGoi => lichSuCuocGoi.lopHoc)
  lichSuCuocGois: LichSuCuocGoi;
}