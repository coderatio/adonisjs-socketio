import 'reflect-metadata'
import SocketMiddlewareContract from '../contracts/middleware.contract.js'

/**
 * Decorator to define middlewares for a specific event.
 *
 * This decorator is used to attach an array of middleware to a specific event
 * within a socket namespace.
 *
 * @param middlewares - Array of middleware instances implementing SocketMiddlewareContract.
 * @returns A decorator function that assigns the middleware metadata to the specified event handler.
 */
export function EventMiddleware(
  ...middlewares: Array<new (...args: any[]) => SocketMiddlewareContract>
) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(`middlewares:${propertyKey}`, middlewares, target)
  }
}
