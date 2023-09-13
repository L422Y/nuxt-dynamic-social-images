
import { ModuleOptions } from './module'

declare module '@nuxt/schema' {
  interface NuxtConfig { ['dsi']?: Partial<ModuleOptions> }
  interface NuxtOptions { ['dsi']?: ModuleOptions }
}


export { ModuleOptions, default } from './module'
