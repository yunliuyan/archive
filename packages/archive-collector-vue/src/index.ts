import type { CollectedDemo, Collector, SourceCode } from '@idux/archive-plugin'
import type { VueCollectorOptions } from './types'

import { parse } from '@vue/compiler-sfc'
import { createMarkdownRenderer } from '@idux/archive-markdown-plugin'
import { readFileSync } from 'fs'
import { basename, dirname, resolve, isAbsolute } from 'pathe'

const META_BLOCK_TYPE = 'archive-meta'

export function createVueCollector(options: VueCollectorOptions): Collector {

  return {
    name: 'vue3',
    resolver: resolveDemo,
    demoRenderer: createDemoRenderer(options?.setup),
    ...options,
  }
}

async function resolveDemo(absolutePath: string) {
  const demoDirPath = dirname(absolutePath)
  const md = await createMarkdownRenderer(demoDirPath)

  const genCodeHtml = (code: string) => md.render('```html \r\n' + code + '\r\n ```')

  const file = readFileSync(absolutePath, 'utf-8')
  const { descriptor } = parse(file)

  let dependencies: string[] = []
  let title: string | undefined
  let description: string | undefined
  const metaBlock = descriptor.customBlocks.find(block => block.type === META_BLOCK_TYPE)
  if (metaBlock) {
    try {
      const { title: _title, description: _desc, dependencies: _dep } = JSON.parse(metaBlock.content)
      _title && (title = _title)
      _desc && (description = _desc)
      _dep && (dependencies = _dep)
    } catch (err) {
      // TODO: error log
    }
  }

  // TODO: remove metaBock from code
  const sourceCodes: SourceCode[] = [
    {
      filename: basename(absolutePath),
      code: `() => ${JSON.stringify(file)}`,
      parsedCode: `() => ${JSON.stringify(genCodeHtml(file))}`,
    },
    ...(dependencies
      .map(depPath => {
        let depFile: string = ''
        try {
          const resolvedFilePath = isAbsolute(depPath) ? depPath : resolve(demoDirPath, depPath)
          depFile = readFileSync(resolvedFilePath, 'utf-8')
        } catch (err) {
          //TODO: error log
        }

        return depFile
          ? {
              filename: basename(depPath),
              code: `() => ${JSON.stringify(depFile)}`,
              parsedCode: `() => ${JSON.stringify(genCodeHtml(depFile))}`,
            }
          : undefined
      })
      .filter(Boolean) as SourceCode[]),
  ]

  return {
    title,
    description,
    component: `() => import(${JSON.stringify(absolutePath)})`,
    sourceCodes,
  }
}

function createDemoRenderer(setup?: string): (demo: CollectedDemo) => string {
  return demo => `import { createInstance } from '@idux/archive-collector-vue/client'
import demo from 'virtual:archive-demo-data:${demo.id}'
${setup && `import setup from ${JSON.stringify(setup)}`}

export default createInstance(demo${setup ? ', setup' : ''})
`
}
