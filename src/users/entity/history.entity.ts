import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { LopHoc } from './class.entity';

@Entity()
export class LichSuCuocGoi {
  @PrimaryGeneratedColumn()
  IDCuocGoi: number;

  @Column()
  TGBatDau: Date;

  @Column()
  TGKetThuc: Date;

  @ManyToOne(() => LopHoc, lopHoc => lopHoc.lichSuCuocGois)
  @JoinColumn({ name: 'IDLop' })
  lopHoc: LopHoc;
}