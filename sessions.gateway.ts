import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SessionsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('ping')
  ping(@MessageBody() payload: any) {
    this.server.emit('pong', payload || { ok: true, ts: Date.now() });
  }

  emitSessionUpdate(sessionId: string, payload: any) {
    this.server.emit('session:update', { sessionId, ...payload });
  }
}
