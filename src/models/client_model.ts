import { WebSocket } from "ws";

export interface IClient {
  id: string;
  socket: WebSocket;
  subscribedNewPosts?: boolean;
}
