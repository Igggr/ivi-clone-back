import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: false })
  surname: string;

  @Column({ nullable: false })
  phoneNumber: string;

  @Column({ nullable: false })
  userId: number;
}
