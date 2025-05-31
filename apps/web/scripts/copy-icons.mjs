// apps/web/scripts/copy-icons.mjs
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Source and destination paths
const srcDir = path.join(__dirname, '../../../packages/ui/src/assets/icons')
const destDir = path.join(__dirname, '../public/packages/ui/src/assets/icons')

function copyIcons() {
  try {
    // Create destination directory if it doesn't exist
    fs.mkdirSync(destDir, { recursive: true })

    // Read all files from source directory
    const files = fs.readdirSync(srcDir)

    // Copy each SVG file
    files.forEach((file) => {
      if (file.endsWith('.svg')) {
        const srcPath = path.join(srcDir, file)
        const destPath = path.join(destDir, file)

        fs.copyFileSync(srcPath, destPath)
        console.log(`Copied: ${file}`)
      }
    })

    console.log(`✅ Successfully copied ${files.filter((f) => f.endsWith('.svg')).length} SVG files`)
  } catch (error) {
    console.error('❌ Error copying icons:', error)
    process.exit(1)
  }
}

copyIcons()
