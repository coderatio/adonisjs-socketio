import 'reflect-metadata'
import SocketMiddlewareContract from '../contracts/middleware.contract.js'

/**
 * Decorator to define middlewares at the socket namespace level.
 *
 * This decorator is used to attach an array of middleware to a socket class.
 * These middlewares will apply to all events within the specified namespace.
 *
 * @param middlewares - Array of middleware instances implementing SocketMiddlewareContract.
 * @returns A decorator function that assigns the middleware metadata to the target class.
 */
export function SocketMiddleware(
  ...middlewares: Array<new (...args: any[]) => SocketMiddlewareContract>
) {
  return function (target: any) {
    Reflect.defineMetadata('middlewares', middlewares, target)
  }
}
