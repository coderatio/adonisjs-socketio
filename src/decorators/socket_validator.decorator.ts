import 'reflect-metadata'
import { ZodSchema } from 'zod'

/**
 * Decorator to validate event payloads using Zod schemas.
 *
 * This decorator attaches a validation schema to a specific event handler.
 * The schema will be used to validate incoming payloads for that event before
 * executing the event handler logic.
 *
 * @param schema - A Zod schema to validate the event payload.
 * @returns A decorator function that assigns the validation schema metadata to the event handler.
 */
export function EventValidator(schema: ZodSchema<any>) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(`eventValidator:${propertyKey}`, schema, target)
  }
}
