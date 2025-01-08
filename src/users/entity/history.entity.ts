import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { LopHoc } from './class.entity';

@Entity()
export class LichSuCuocGoi {
  @PrimaryGeneratedColumn()
  IDCuocGoi: number;

  @Column({ nullable: false })
  MaLop: string;

  @OneToOne(() => LopHoc, lopHoc => lopHoc.lichSuCuocGois)
  @JoinColumn({ name: 'MaLop', referencedColumnName: 'MaLop' })
  lopHoc: LopHoc;

  @Column()
  TGBatDau: Date;

  @Column()
  TGKetThuc: Date;

}