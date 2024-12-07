import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'
export class Ws {
  static io: Server
  private static booted = false

  static boot() {
    /**
     * Ignore multiple calls to the boot method
     */
    if (this.booted) {
      return
    }

    this.booted = true
    this.io = new Server(server.getNodeServer(), {
      cors: {
        origin: '*',
      },
    })
  }
}
