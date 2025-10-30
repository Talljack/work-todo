/**
 * 创建 Chrome Web Store 宣传图（背景图 + 图标合成）
 * 使用 Node.js + canvas
 */

import fs from 'fs'
import { createCanvas, loadImage } from 'canvas'

// 文件路径
const ICON_PATH = 'src/assets/icons/icon-256.png'
const BACKGROUND_PATH = 'assets/store/promo-marquee-1400x560.png'
const OUTPUT_PATH = 'assets/store/promo-marquee-with-icon-1400x560.png'
const OUTPUT_LARGE_PATH = 'assets/store/promo-large-with-icon-1280x800.png'
const OUTPUT_SMALL_PATH = 'assets/store/promo-small-with-icon-440x280.png'

async function createPromoWithIcon() {
  console.log('🎨 开始创建宣传图...\n')

  try {
    // 1. 加载背景图和图标
    console.log(`📂 加载背景图: ${BACKGROUND_PATH}`)
    const background = await loadImage(BACKGROUND_PATH)

    console.log(`📂 加载图标: ${ICON_PATH}`)
    const icon = await loadImage(ICON_PATH)

    // 2. 创建 canvas
    const bgWidth = background.width
    const bgHeight = background.height
    console.log(`📐 背景图尺寸: ${bgWidth}x${bgHeight}`)

    const canvas = createCanvas(bgWidth, bgHeight)
    const ctx = canvas.getContext('2d')

    // 3. 绘制背景
    ctx.drawImage(background, 0, 0)

    // 4. 计算图标大小和位置
    const iconSize = Math.floor(bgHeight * 0.45) // 图标大小为高度的 45%
    const iconX = Math.floor(bgWidth * 0.15) // 左侧 15% 位置
    const iconY = Math.floor((bgHeight - iconSize) / 2) // 垂直居中

    console.log(`🔧 图标大小: ${iconSize}x${iconSize}`)
    console.log(`📍 图标位置: (${iconX}, ${iconY})`)

    // 5. 绘制图标
    ctx.drawImage(icon, iconX, iconY, iconSize, iconSize)

    // 6. 保存结果
    console.log(`💾 保存到: ${OUTPUT_PATH}`)
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(OUTPUT_PATH, buffer)
    console.log(`✅ 成功创建: ${OUTPUT_PATH}\n`)

    return canvas
  } catch (error) {
    console.error('❌ 错误:', error.message)
    throw error
  }
}

async function createAllPromoSizes() {
  console.log('='.repeat(60))
  console.log('🎨 创建所有尺寸的宣传图')
  console.log('='.repeat(60) + '\n')

  // 创建 Marquee 尺寸 (1400x560)
  console.log('1️⃣ 创建 Marquee 宣传图 (1400x560)...')
  const marqueeCanvas = await createPromoWithIcon()

  // 创建 Large 尺寸 (1280x800)
  console.log('2️⃣ 创建 Large 宣传图 (1280x800)...')
  const largeCanvas = createCanvas(1280, 800)
  const largeCtx = largeCanvas.getContext('2d')
  largeCtx.drawImage(marqueeCanvas, 0, 0, 1280, 800)
  fs.writeFileSync(OUTPUT_LARGE_PATH, largeCanvas.toBuffer('image/png'))
  console.log(`✅ 成功创建: ${OUTPUT_LARGE_PATH}\n`)

  // 创建 Small 尺寸 (440x280)
  console.log('3️⃣ 创建 Small 宣传图 (440x280)...')
  const smallCanvas = createCanvas(440, 280)
  const smallCtx = smallCanvas.getContext('2d')
  smallCtx.drawImage(marqueeCanvas, 0, 0, 440, 280)
  fs.writeFileSync(OUTPUT_SMALL_PATH, smallCanvas.toBuffer('image/png'))
  console.log(`✅ 成功创建: ${OUTPUT_SMALL_PATH}\n`)

  console.log('='.repeat(60))
  console.log('🎉 所有宣传图创建完成！')
  console.log('='.repeat(60))
  console.log('\n📁 生成的文件:')
  console.log(`  1. ${OUTPUT_PATH}`)
  console.log(`  2. ${OUTPUT_LARGE_PATH}`)
  console.log(`  3. ${OUTPUT_SMALL_PATH}`)
  console.log('\n📝 使用说明:')
  console.log('  上传 promo-large-with-icon-1280x800.png 到 Chrome Web Store')
  console.log('  路径: Store listing > Promotional images > Large promo tile\n')
}

// 运行
createAllPromoSizes().catch(console.error)
