import 'reflect-metadata'

/**
 * Decorator to mark a method as a Socket Event
 */
export function SocketEvent() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata('isSocketEvent', true, target, propertyKey)
  }
}
