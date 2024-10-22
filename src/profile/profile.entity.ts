import { Entity, PrimaryColumn, Column, OneToOne } from 'typeorm';
import { User } from '../users/entity/user.entity';

@Entity()
export class ThongTinCaNhan {
  @PrimaryColumn()
  Email: string;

  @Column()
  HoTen: string;

  @Column()
  NgaySinh: Date;

  @Column()
  GioiTinh: string;

  @Column()
  DiaChi: string;

  @Column()
  SoDienThoai: string;

  @Column()
  AnhDaiDien: string

  @OneToOne(() => User, users => users.thongTinCaNhan)
  users: User;
}