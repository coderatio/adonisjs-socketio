import type { BaseSocket } from '../src/base.socket.js'
import app from '@adonisjs/core/services/app'
import type { Ws } from '../src/socket_manager.js'

let socket: BaseSocket
let ws: Ws

await app.booted(async () => {
  socket = await app.container.make('socket')
  ws = await app.container.make('ws')
})

export { socket, ws }
