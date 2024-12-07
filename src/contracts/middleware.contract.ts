import { Socket } from 'socket.io'

export default interface SocketMiddlewareContract {
  validate(socket: Socket, next: (err?: Error) => void): Promise<void>
}
