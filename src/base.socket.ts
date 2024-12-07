import { Server, Socket } from 'socket.io'
import { ZodError, ZodSchema } from 'zod'
import SocketExecption from './exceptions/socket.exeception.js'
import SocketMiddlewareContract from './contracts/middleware.contract.js'

export class BaseSocket {
  private io: Server

  /**
   * Constructor to initialize the AdonisSocket instance with a Socket.IO server.
   * @param io The Socket.IO server instance.
   */
  constructor(io: Server) {
    this.io = io
  }

  /**
   * Registers a socket handler class to a specific namespace.
   *
   * The handler class must use the @SocketNamespace decorator to define its namespace.
   * Optionally, class-level middlewares can be applied using the @SocketMiddleware decorator.
   * Event handlers within the class are dynamically registered, and event-specific middleware and validation can be applied.
   *
   * @param handlerClass The handler class containing event handler methods and metadata.
   * @throws ConflictException if the handler class lacks a namespace or invalid middleware is provided.
   */
  register(handlerClass: any) {
    // Retrieve the namespace defined in the handler class metadata
    const namespace = Reflect.getMetadata('namespace', handlerClass)
    const classMiddlewares = Reflect.getMetadata('middlewares', handlerClass) || []

    // Ensure the namespace is defined
    if (!namespace) {
      throw new SocketExecption('Handler must have a @SocketNamespace decorator.')
    }

    // Create or retrieve the namespace
    const nsp = this.io.of(namespace)

    // Set up connection listener for the namespace
    nsp.on('connection', async (socket: Socket) => {
      console.info(`Socket user ${socket.id} connected to namespace: ${namespace}`)

      // Apply class-level middleware
      for (const MiddlewareClass of classMiddlewares) {
        const middlewareInstance: SocketMiddlewareContract = new MiddlewareClass()
        if (typeof middlewareInstance.validate !== 'function') {
          throw new SocketExecption(`Middleware for namespace "${namespace}" is invalid.`)
        }

        // Execute middleware validation
        await new Promise<void>((resolve, reject) =>
          middlewareInstance.validate(socket, (err: any) => (err ? reject(err) : resolve()))
        )
      }

      // Instantiate the handler class with the connected socket and utility instance
      const handlerInstance = new handlerClass(socket)

      // Dynamically register methods as events
      const events = Object.getOwnPropertyNames(handlerClass.prototype)
        .filter((method) => method !== 'constructor')
        .filter((method) => Reflect.getMetadata('isSocketEvent', handlerClass.prototype, method))

      for (const event of events) {
        const middlewares =
          Reflect.getMetadata(`middlewares:${event}`, handlerClass.prototype) || []

        // Set up listener for each event
        socket.on(event, async (payload: any) => {
          try {
            // Apply event-specific middleware
            for (const MiddlewareClass of middlewares) {
              const middlewareInstance: SocketMiddlewareContract = new MiddlewareClass()

              if (typeof middlewareInstance.validate !== 'function') {
                throw new SocketExecption(
                  `Middleware for event "${event}" in ${handlerClass} is invalid.`
                )
              }
              // Execute middleware validation
              await new Promise<void>((resolve, reject) =>
                middlewareInstance.validate(socket, (err: any) => (err ? reject(err) : resolve()))
              )
            }

            // Retrieve and apply validation schema, if any
            const schema: ZodSchema = Reflect.getMetadata(
              `eventValidator:${event}`,
              handlerClass.prototype
            )
            if (schema) {
              payload = schema.parse(payload) // Validate payload using Zod
            }

            // Invoke the corresponding event handler method
            await handlerInstance[event](payload)
          } catch (err: any) {
            if (err instanceof ZodError) {
              // Handle validation errors
              console.error(
                `Socket validation failed for event ${event} on namespace ${namespace}:`
              )
              console.error(err.errors)
              socket.emit('validationError', { event, errors: err.errors })
            } else {
              // Handle general errors
              console.error(`Error in event ${event} on the namespace ${namespace}:`)
              console.error(err)
              socket.emit('error', { event, error: err.message })
            }
          }
        })
      }
    })

    return this
  }
}
