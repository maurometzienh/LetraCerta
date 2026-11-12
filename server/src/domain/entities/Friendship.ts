import { Entity, Enum, ManyToOne, type Opt, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { User } from './User.js';

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity({ tableName: 'friendships' })
@Unique({ properties: ['requester', 'addressee'] })
export class Friendship {
  @PrimaryKey({ type: 'number' })
  id!: number;

  @ManyToOne(() => User)
  requester!: User;

  @ManyToOne(() => User)
  addressee!: User;

  @Enum(() => FriendshipStatus)
  status: FriendshipStatus & Opt = FriendshipStatus.PENDING;

  @Property({ type: 'datetime' })
  createdAt: Date & Opt = new Date();

  @Property({ type: 'datetime', nullable: true })
  respondedAt?: Date;
}
