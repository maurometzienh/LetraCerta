import { FriendshipRepository } from '../repositories/FriendshipRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { FriendshipStatus } from '../domain/entities/Friendship.js';
import { User } from '../domain/entities/User.js';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors.js';

export interface FriendDTO {
  id: number;
  username: string;
}

export interface PendingRequestDTO {
  requestId: number;
  from: FriendDTO;
  createdAt: Date;
}

export class FriendshipService {
  constructor(
    private readonly friendshipRepository: FriendshipRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async sendRequest(requester: User, addresseeUsername: string): Promise<void> {
    const addressee = await this.userRepository.findByUsername(addresseeUsername);
    if (!addressee) {
      throw new NotFoundError('Usuário não encontrado.');
    }
    if (addressee.id === requester.id) {
      throw new AppError('Você não pode adicionar a si mesmo.', 422);
    }

    const existing = await this.friendshipRepository.findBetween(requester, addressee);

    if (existing) {
      if (existing.status === FriendshipStatus.ACCEPTED) {
        throw new ConflictError('Vocês já são amigos.');
      }
      if (existing.status === FriendshipStatus.PENDING) {
        throw new ConflictError('Já existe um pedido de amizade pendente entre vocês.');
      }
      // REJECTED anteriormente: permite tentar de novo.
      existing.requester = requester;
      existing.addressee = addressee;
      existing.status = FriendshipStatus.PENDING;
      existing.createdAt = new Date();
      existing.respondedAt = undefined;
    } else {
      this.friendshipRepository.create(requester, addressee);
    }

    await this.friendshipRepository.flush();
  }

  async respondToRequest(user: User, friendshipId: number, accept: boolean): Promise<void> {
    const friendship = await this.friendshipRepository.findById(friendshipId);
    if (!friendship) {
      throw new NotFoundError('Pedido de amizade não encontrado.');
    }
    if (friendship.addressee.id !== user.id) {
      throw new UnauthorizedError('Esse pedido de amizade não é seu.');
    }
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new ConflictError('Esse pedido já foi respondido.');
    }

    friendship.status = accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.REJECTED;
    friendship.respondedAt = new Date();
    await this.friendshipRepository.flush();
  }

  async listFriends(user: User): Promise<FriendDTO[]> {
    const friendships = await this.friendshipRepository.findAcceptedForUser(user);
    return friendships.map((friendship) => {
      const other = friendship.requester.id === user.id ? friendship.addressee : friendship.requester;
      return { id: other.id, username: other.username };
    });
  }

  async listIncomingPending(user: User): Promise<PendingRequestDTO[]> {
    const friendships = await this.friendshipRepository.findIncomingPending(user);
    return friendships.map((friendship) => ({
      requestId: friendship.id,
      from: { id: friendship.requester.id, username: friendship.requester.username },
      createdAt: friendship.createdAt,
    }));
  }

  /** Usado pelo módulo de duelo: só posso desafiar quem já é meu amigo. */
  async assertAreFriends(userA: User, userB: User): Promise<void> {
    const friendship = await this.friendshipRepository.findBetween(userA, userB);
    if (!friendship || friendship.status !== FriendshipStatus.ACCEPTED) {
      throw new AppError('Vocês precisam ser amigos para fazer isso.', 403);
    }
  }
}
