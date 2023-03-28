/**
 * @license
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/IDuxFE/archive/blob/main/LICENSE
 */

import { watch } from 'chokidar'

export function watchDir(dir: string, cb: () => void): () => void {
  const watcher = watch(dir, { ignoreInitial: true })

  watcher.on('add', cb)
  watcher.on('unlink', cb)

  return () => watcher.close()
}
