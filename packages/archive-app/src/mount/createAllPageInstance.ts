import type { AppMountOptions, PageInstance } from '../types'

import { resolveThemeOptions } from '../resolveThemeOptions'
import { createPageInstance } from './createPageInstance'

export function createAllPageInstance(options: AppMountOptions) {
  const { routeRecords, theme } = options
  const reseolvedTheme = resolveThemeOptions(theme)

  const instances: Record<string, PageInstance> = {}

  routeRecords.forEach(record => {
    instances[record.path] = createPageInstance(record, reseolvedTheme)
  })

  return instances
}