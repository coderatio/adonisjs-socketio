import type { ApplicationService } from '@adonisjs/core/types'
import { BaseSocket } from '../src/base.socket.js'
import { Server } from 'socket.io'
import server from '@adonisjs/core/services/server'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    socket: BaseSocket
    ws: {
      io: Server
    }
  }
}

export default class WsProvider {
  private io!: Server

  constructor(protected app: ApplicationService) {}

  public ready() {
    this.app.container.singleton('ws', () => {
      if (!this.io) {
        const nodeServer = server.getNodeServer()
        if (!nodeServer) {
          console.log('Node server is not available')
        }

        this.io = new Server(nodeServer, {
          cors: {
            origin: '*',
          },
        })
      }

      return { io: this.io }
    })

    this.app.container.singleton('socket', () => {
      if (!this.io) {
        console.log('WebSocket server is not initialized')
      }
      return new BaseSocket(this.io)
    })
  }

  public shutdown() {
    if (this.io) {
      this.io.close()
    }
  }
}
