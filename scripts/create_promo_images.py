#!/usr/bin/env python3
"""
创建 Chrome Web Store 宣传图（背景图 + 图标合成）
生成带图标的宣传图用于 Chrome Web Store
"""

from PIL import Image
import os

# 文件路径
ICON_PATH = 'src/assets/icons/icon-256.png'
BACKGROUND_PATH = 'assets/store/promo-marquee-1400x560.png'
OUTPUT_PATH = 'assets/store/promo-marquee-with-icon-1400x560.png'

# 备选输出路径（如果需要不同尺寸）
OUTPUT_LARGE_PATH = 'assets/store/promo-large-with-icon-1280x800.png'
OUTPUT_SMALL_PATH = 'assets/store/promo-small-with-icon-440x280.png'

def create_promo_with_icon():
    """创建带图标的宣传图"""

    print("🎨 开始创建宣传图...")

    # 1. 加载背景图和图标
    print(f"📂 加载背景图: {BACKGROUND_PATH}")
    background = Image.open(BACKGROUND_PATH).convert('RGBA')

    print(f"📂 加载图标: {ICON_PATH}")
    icon = Image.open(ICON_PATH).convert('RGBA')

    # 2. 调整图标大小（根据背景图尺寸）
    bg_width, bg_height = background.size
    print(f"📐 背景图尺寸: {bg_width}x{bg_height}")

    # 图标大小设置为背景高度的 40-50%
    icon_size = int(bg_height * 0.45)  # 约 252px (560 * 0.45)
    print(f"🔧 调整图标大小: {icon_size}x{icon_size}")

    icon_resized = icon.resize((icon_size, icon_size), Image.Resampling.LANCZOS)

    # 3. 计算图标位置（居中偏左）
    # 左侧留出 20% 的空间，垂直居中
    icon_x = int(bg_width * 0.15)  # 左侧 15% 位置
    icon_y = (bg_height - icon_size) // 2  # 垂直居中

    print(f"📍 图标位置: ({icon_x}, {icon_y})")

    # 4. 合成图片
    # 创建背景的副本
    result = background.copy()

    # 将图标粘贴到背景上（使用 alpha 通道实现透明）
    result.paste(icon_resized, (icon_x, icon_y), icon_resized)

    # 5. 保存结果
    print(f"💾 保存到: {OUTPUT_PATH}")
    result.save(OUTPUT_PATH, 'PNG', optimize=True)
    print(f"✅ 成功创建: {OUTPUT_PATH}")

    return result

def create_all_promo_sizes():
    """创建所有尺寸的宣传图"""

    print("\n" + "="*60)
    print("🎨 创建所有尺寸的宣传图")
    print("="*60 + "\n")

    # 创建 Marquee 尺寸 (1400x560)
    print("1️⃣ 创建 Marquee 宣传图 (1400x560)...")
    marquee = create_promo_with_icon()

    # 创建 Large 尺寸 (1280x800)
    print("\n2️⃣ 创建 Large 宣传图 (1280x800)...")
    large = marquee.resize((1280, 800), Image.Resampling.LANCZOS)
    large.save(OUTPUT_LARGE_PATH, 'PNG', optimize=True)
    print(f"✅ 成功创建: {OUTPUT_LARGE_PATH}")

    # 创建 Small 尺寸 (440x280)
    print("\n3️⃣ 创建 Small 宣传图 (440x280)...")
    small = marquee.resize((440, 280), Image.Resampling.LANCZOS)
    small.save(OUTPUT_SMALL_PATH, 'PNG', optimize=True)
    print(f"✅ 成功创建: {OUTPUT_SMALL_PATH}")

    print("\n" + "="*60)
    print("🎉 所有宣传图创建完成！")
    print("="*60)
    print(f"\n📁 生成的文件:")
    print(f"  1. {OUTPUT_PATH}")
    print(f"  2. {OUTPUT_LARGE_PATH}")
    print(f"  3. {OUTPUT_SMALL_PATH}")
    print("\n📝 使用说明:")
    print("  上传 promo-large-with-icon-1280x800.png 到 Chrome Web Store")
    print("  路径: Store listing > Promotional images > Large promo tile")

if __name__ == '__main__':
    # 检查文件是否存在
    if not os.path.exists(ICON_PATH):
        print(f"❌ 错误: 找不到图标文件 {ICON_PATH}")
        exit(1)

    if not os.path.exists(BACKGROUND_PATH):
        print(f"❌ 错误: 找不到背景图文件 {BACKGROUND_PATH}")
        exit(1)

    # 创建输出目录
    os.makedirs('assets/store', exist_ok=True)

    # 创建所有尺寸
    create_all_promo_sizes()
