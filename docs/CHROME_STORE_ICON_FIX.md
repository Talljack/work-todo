# Chrome Web Store 图标上传完整指南

## 问题描述

Chrome Web Store 展示页面的图标区域显示为空白（只有渐变背景），这是因为需要在 Developer Dashboard 中单独上传 Store Icon。

## 解决步骤

### 1. 准备图标文件

使用项目中的图标：

```
路径：/Users/yugangcao/apps/my-apps/work-todo/src/assets/icons/icon-128.png
尺寸：128 x 128 像素
格式：PNG
```

### 2. 上传到 Chrome Web Store

#### 步骤 A: 登录 Developer Dashboard

1. 打开浏览器，访问：https://chrome.google.com/webstore/devconsole
2. 使用你的 Google 账号登录（必须是发布扩展时使用的账号）

#### 步骤 B: 找到你的扩展

1. 在 Developer Dashboard 主页，找到 **Routine Reminder** 扩展
2. 点击扩展名称或卡片，进入扩展详情页面

#### 步骤 C: 进入 Store Listing 页面

1. 在左侧导航栏中，点击 **"Store listing"**（商店列表）
2. 如果是中文界面，可能显示为 **"商店信息"**

#### 步骤 D: 上传图标

1. 在 Store listing 页面向下滚动
2. 找到 **"Icon"** 部分（通常在页面中部）
3. 看到以下内容：
   ```
   Icon *
   Required
   Upload a 128x128 pixel icon for your item
   ```
4. 点击 **"Choose file"** 或 **"选择文件"** 按钮
5. 在文件选择器中，导航到：
   ```
   /Users/yugangcao/apps/my-apps/work-todo/src/assets/icons/
   ```
6. 选择 **icon-128.png**
7. 点击 **"打开"** 或 **"Open"**

#### 步骤 E: 验证上传

上传成功后，你应该能看到：

- ✅ 图标预览显示你的蓝色渐变图标
- ✅ 图标下方显示文件名和尺寸信息
- ✅ 如果图标有问题，会显示红色错误提示

#### 步骤 F: 保存更改

1. 滚动到页面底部
2. 点击 **"Save draft"**（保存草稿）或 **"Submit for review"**（提交审核）
   - 如果扩展已发布：选择 **"Submit for review"** 重新提交
   - 如果还在开发：选择 **"Save draft"** 即可

### 3. 等待生效

- **草稿状态**：立即生效，刷新页面即可看到图标
- **已发布扩展**：需要重新审核，审核通过后生效（通常 1-3 天）

## 常见问题

### Q1: 上传后还是看不到图标？

**解决方案：**

1. 清除浏览器缓存：Ctrl+Shift+Delete（Windows）或 Cmd+Shift+Delete（Mac）
2. 使用隐身模式访问 Chrome Web Store
3. 等待 5-10 分钟让 CDN 缓存更新
4. 检查是否点击了"保存"按钮

### Q2: 提示图标尺寸不正确？

**检查要求：**

- ✅ 尺寸必须正好是 **128 x 128 像素**
- ✅ 格式必须是 **PNG**（不支持 JPG、GIF、SVG）
- ✅ 文件大小 < 16MB
- ✅ 不能是透明背景（需要有颜色）

如果你的图标是 128x128 但还是提示错误，可能是：

- 图标是矢量图或其他格式被错误命名为 .png
- 图标元数据有问题

**解决方法：**

```bash
# 重新导出图标（如果有 ImageMagick）
convert icon-128.png -resize 128x128! icon-128-fixed.png

# 或使用在线工具：
# https://www.iloveimg.com/resize-image
# 设置为 128x128 像素，PNG 格式
```

### Q3: 图标看起来模糊？

当前图标（128x128）在大尺寸展示时可能模糊。

**建议：**

1. 使用更大的源图标（256x256 或 512x512）
2. 在 Photoshop/Figma 中导出为 128x128 的高质量 PNG
3. 确保图标内容简洁清晰，避免过于复杂的细节

### Q4: 想要更好看的图标？

你可以：

**选项 A：使用现有的 512x512 图标缩小**

```bash
# 项目中已有 icon-512.png
# 直接使用它可能效果更好（Chrome 会自动缩放）
# 路径：/Users/yugangcao/apps/my-apps/work-todo/src/assets/icons/icon-512.png
```

**选项 B：创建专门的 Store 图标**

- 在 Figma/Photoshop 中设计 128x128 的图标
- 突出品牌元素（蓝色渐变 + 对勾）
- 确保在小尺寸下依然清晰可辨

## 验证步骤

上传完成后，验证是否成功：

### 验证 1: 在 Developer Dashboard 中查看

1. 刷新 Store listing 页面
2. Icon 部分应该显示你上传的图标
3. 预览图标是否清晰、颜色正确

### 验证 2: 在 Chrome Web Store 查看

1. 打开你的扩展页面（公开链接）
2. 检查左侧图标区域是否显示
3. 如果还是空白：
   - 清除缓存
   - 等待 10 分钟
   - 使用隐身模式查看

### 验证 3: 检查不同位置

Chrome Web Store 在多个地方使用图标：

- ✅ 扩展详情页（左侧大图）
- ✅ 搜索结果列表
- ✅ 分类页面
- ✅ 用户评论区

确保所有地方都正确显示。

## 最终检查清单

在提交前，确保：

- [ ] 图标已上传到 Developer Dashboard
- [ ] 图标尺寸正确（128x128）
- [ ] 图标格式正确（PNG）
- [ ] 已点击"保存"按钮
- [ ] 等待 5-10 分钟让更改生效
- [ ] 清除浏览器缓存
- [ ] 在隐身模式验证
- [ ] 图标在扩展详情页正确显示

## 如果还是不行

请提供以下信息以便进一步诊断：

1. **截图**：Developer Dashboard 的 Icon 部分截图
2. **错误信息**：如果有任何红色错误提示，请截图
3. **扩展状态**：草稿 / 待审核 / 已发布
4. **浏览器**：Chrome 版本号
5. **操作系统**：macOS / Windows / Linux

---

**最后更新**：2025-10-26
**相关文档**：

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Icon Guidelines](https://developer.chrome.com/docs/webstore/images/)
