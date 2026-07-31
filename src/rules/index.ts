// Public entry point. `resolve` is the engine bound to the shipped data.

import { shippedData } from './data.ts'
import { createResolver } from './resolve.ts'

export const resolve = createResolver(shippedData)

export { createResolver } from './resolve.ts'
export { shippedData } from './data.ts'
export type * from './types.ts'
