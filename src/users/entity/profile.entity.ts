import { Entity, PrimaryColumn, Column, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class ThongTinCaNhan {
  @PrimaryColumn()
  userId: number;

  @Column({ nullable: true, type: 'timestamp' })
  NgaySinh: Date;

  @Column({nullable: true})
  GioiTinh: string;

  @Column({nullable: true})
  DiaChi: string;

  @Column({nullable: true})
  SoDienThoai: string;

  @Column({nullable: true})
  AnhDaiDien: string;

  @OneToOne(() => User, (users) => users.thongTinCaNhan)
  @JoinColumn({name: 'userId'})
  users: User;
}
