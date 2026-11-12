export interface Friend {
  id: number;
  username: string;
}

export interface PendingRequest {
  requestId: number;
  from: Friend;
  createdAt: string;
}
