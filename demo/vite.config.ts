import * as fs from 'fs'
import * as path from 'path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { createHtmlPlugin } from 'vite-plugin-html'

const ZOD_DTS_FILES: { content: string, filePath: string }[] = []

initZOD_DTS_FILES: {
  const nodeModulesPath = path.join(__dirname, '../node_modules')
  const zodPackagePath = path.join(nodeModulesPath, 'zod/lib')

  function addZodDtsFileContent(filePath: string) {
    let content = fs.readFileSync(filePath, 'utf-8')
    ZOD_DTS_FILES.push({
      content,
      filePath: filePath.replace(zodPackagePath, 'file:///node_modules/@types/zod')
    })
  }
  function findZodDtsFiles(dirPath: string) {
    const files = fs.readdirSync(dirPath)
    for (const file of files) {
      const filePath = path.join(dirPath, file)
      const stats = fs.statSync(filePath)
      if (stats.isDirectory()) {
        findZodDtsFiles(filePath)
      } else if (stats.isFile() && path.basename(filePath).endsWith('.d.ts')) {
        addZodDtsFileContent(filePath)
      }
    }
  }
  findZodDtsFiles(zodPackagePath)
}

const commonInjectData: Record<string, string> = {
  HEADER: fs.readFileSync(path.resolve(process.cwd(), './public/header.html')).toString(),
}

export default defineConfig({
  base: '/zodui/',
  plugins: [
    react(),
    tsconfigPaths(),
    createHtmlPlugin({
      pages: [
        {
          filename: 'index.html',
          template: 'index.html',
          injectOptions: {
            data: {
              ...commonInjectData,
              ZOD_DTS_FILES: JSON.stringify([])
            }
          }
        },
        {
          filename: 'play',
          template: 'public/play.html',
          injectOptions: {
            data: {
              ...commonInjectData,
              ZOD_DTS_FILES: JSON.stringify(ZOD_DTS_FILES)
            }
          }
        }
      ]
    })
  ],
})
