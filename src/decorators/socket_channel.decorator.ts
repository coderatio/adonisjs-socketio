import 'reflect-metadata'

/**
 * Decorator to define a socket namespace.
 *
 * This decorator is used to attach a namespace to a socket class, allowing
 * it to register its events and listeners under the specified namespace.
 *
 * @param name - The name of the namespace (e.g., "/driver").
 * @returns A decorator function that assigns the namespace metadata to the target class.
 */
export function SocketChannel(name: string) {
  return function (target: any) {
    Reflect.defineMetadata('namespace', name, target)
  }
}
