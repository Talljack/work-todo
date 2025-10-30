/**
 * 创建带背景的正方形图标（用于 Chrome Web Store Icon）
 */

import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'

const ICON_PATH = 'src/assets/icons/icon-128.png'
const OUTPUT_PATH = 'assets/store/icon-with-background-128.png'

async function createIconWithBackground() {
  console.log('🎨 创建带背景的正方形图标...\n')

  // 创建 128x128 canvas
  const size = 128
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // 绘制渐变背景（蓝紫色渐变）
  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, '#667eea') // 蓝色
  gradient.addColorStop(1, '#764ba2') // 紫色

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  // 在中间绘制圆角矩形白色区域
  const padding = 12
  const innerSize = size - padding * 2
  const radius = 12

  ctx.fillStyle = 'white'
  ctx.beginPath()
  ctx.roundRect(padding, padding, innerSize, innerSize, radius)
  ctx.fill()

  // 加载并绘制图标
  const icon = await loadImage(ICON_PATH)
  const iconPadding = 20
  const iconSize = size - iconPadding * 2

  ctx.drawImage(icon, iconPadding, iconPadding, iconSize, iconSize)

  // 保存
  fs.writeFileSync(OUTPUT_PATH, canvas.toBuffer('image/png'))
  console.log(`✅ 成功创建: ${OUTPUT_PATH}`)
  console.log(`📐 尺寸: ${size}x${size}`)
  console.log(`\n📝 使用说明:`)
  console.log(`  上传到 Chrome Web Store > Store listing > Icon`)
}

createIconWithBackground().catch(console.error)
