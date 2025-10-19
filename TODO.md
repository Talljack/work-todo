# TODO - 未来开发路线图

本文档概述了 Routine Reminder 未来版本的计划功能、改进和任务。

---

## 发布前检查清单 (v1.0.0)

提交到 Chrome Web Store 之前：

- [x] 核心功能已实现
  - [x] 可定制的工作时间表
  - [x] 提醒模板（中英文）
  - [x] 多种提醒方式
  - [x] 统计仪表板
  - [x] 键盘快捷键
  - [x] 首次引导体验
  - [x] 历史记录追踪（90天）

- [x] 文档
  - [x] README.md
  - [x] CHANGELOG.md
  - [x] PRIVACY_POLICY.md
  - [x] CHROME_STORE_DESCRIPTION.md

- [x] 资源和媒体
  - [x] 图标 128x128（必需）
  - [x] 小型宣传图 440x280（必需）
  - [x] 大型宣传图 1280x800（可选但推荐）
  - [x] 横幅宣传图 1400x560（可选）
  - [x] 截图（3-5张图片，1280x800 或 640x400）
    - [x] 主弹窗视图
    - [x] 设置页面
    - [x] 统计仪表板
    - [x] 引导流程
    - [x] 通知演示
  - 存放位置：`assets/store/`

- [ ] 测试
  - [ ] 测试所有键盘快捷键
  - [ ] 测试不同时区
  - [ ] 测试导出/导入功能
  - [ ] 测试不同标签页的通知
  - [ ] 测试连续记录计算
  - [ ] 测试语言切换
  - [ ] 测试 macOS（Cmd）和 Windows（Ctrl）

- [ ] 最终审查
  - [x] 审查所有翻译（中英文）
  - [x] 拼写检查所有面向用户的文本
  - [x] 验证 README 中的所有链接
  - [x] 添加 GitHub 仓库 URL 到 manifest
  - [x] 添加支持邮箱到 manifest
  - [x] 测试生产构建
  - [ ] 创建 git 标签 v1.0.0

---

## v1.1 - 有温度的提醒体验 (2025年Q2 - 立即开始！)

**主题：情感化与个性化**
**预计开发时间：2-3周**
**核心价值：让提醒有温度，打造差异化竞争优势**

### 🌟 超高优先级（必做！投入产出比最高）

- [ ] **声音提醒系统** 🔊 **（Week 1-2）**
  - [ ] 准备9个音效文件（3种风格 × 3种紧急度）
    - [ ] 专业风格：柔和提示音、标准邮件音、紧急警报
    - [ ] 可爱风格：铃铛声、猫叫声、可爱警报
    - [ ] 极简风格：简单叮、咔嗒、哔哔
  - [ ] 从 Freesound.org 下载或制作音效
  - [ ] 压缩优化到每个<50KB，总共<500KB
  - [ ] 实现 soundManager.ts 核心模块
  - [ ] 集成 Web Audio API
  - [ ] 音量控制滑块（0-100%）
  - [ ] 试听功能（用户可以预览每个声音）
  - [ ] 遵守浏览器自动播放策略
  - [ ] 处理声音播放失败的降级方案

- [ ] **文案风格系统** 💬 **（Week 2-3）**
  - [ ] 创建 messageStyleManager.ts 核心模块
  - [ ] 设计5种风格的文案体系
    - [ ] **专业严肃**：正式、得体（企业用户）
      - 中文："请及时更新今日例行任务"
      - 英文："Reminder: Daily routine check-in"
    - [ ] **可爱温柔**：拟人化、有emoji（年轻用户）
      - 中文："主人，该写今天的小目标啦~ ≧◡≦"
      - 英文："Hi there! Time to share today's plans! 🌸"
    - [ ] **激励鼓舞**：正能量、强调成就
      - 中文："加油！你已经坚持了{{streak}}天，继续保持！💪"
      - 英文："You're doing great! {{streak}} days streak! 🔥"
    - [ ] **幽默诙谐**：轻松搞笑
      - 中文："你的例行任务在等你哦，别让它孤单 😏"
      - 英文："Your routine is getting lonely... 🤣"
    - [ ] **极简风格**：简洁直接
      - 中文："例行任务?"
      - 英文："Routine?"
  - [ ] 为每种风格编写20-30条中英文文案
  - [ ] 覆盖不同场景（首次/重复/迟到/很迟）
  - [ ] 支持变量插值：{{streak}}、{{time}}、{{deadline}}
  - [ ] 随机选择机制（避免重复）
  - [ ] 文案质量审核和打磨

- [ ] **风格同步与UI** 🎨 **（Week 3）**
  - [ ] 声音和文案风格自动匹配
  - [ ] 设置页面新增"提醒风格"卡片
  - [ ] 5个风格选择按钮（带图标）
  - [ ] 声音选择下拉菜单
  - [ ] 音量滑块组件
  - [ ] 实时预览功能
    - [ ] 点击试听声音
    - [ ] 显示示例文案
  - [ ] 保存用户偏好到配置
  - [ ] 在所有提醒点应用新风格

### 高优先级

- [ ] **深色模式支持** 🌙
  - [ ] 在设置中添加深色模式切换
  - [ ] 创建深色主题颜色
  - [ ] 更新所有组件以支持深色模式
  - [ ] 系统偏好自动检测
  - [ ] 平滑的主题过渡

### 中优先级

- [ ] **右键菜单集成** 📋
  - [ ] 右键复制 提醒模板
  - [ ] 右键标记为已完成
  - [ ] 右键打开统计

- [ ] **通知改进**
  - [ ] 暂停通知 X 分钟
  - [ ] 通知操作按钮（标记为已完成、暂停）

### 低优先级

- [ ] **UI 完善**
  - [ ] 为统计卡片添加动画
  - [ ] 连续里程碑时的彩纸动画
  - [ ] 更好的加载状态

---

**v1.1 开发资源需求：**

- 开发者：1人 × 2-3周
- UI/UX设计：0.5人（设计风格选择界面）
- 文案创作：100条文案（中英文各50条）
- 音效资源：免费音效库或外包（$50-100）

**v1.1 成功指标：**

- 用户评价："这个扩展太可爱了！"
- 温度 > 功能
- 情感连接 > 复杂度

---

## v1.2 - 本地智能分析 (2025年Q3)

**主题：智能但隐私**
**预计开发时间：3-4周**
**核心价值：用算法理解用户，无需AI API**

### 高优先级

- [ ] **用户习惯分析引擎** 🧠 **（纯本地算法，无AI）**
  - [ ] 创建 analytics/userPatternAnalyzer.ts
  - [ ] 分析用户的发送时间模式
    - [ ] 统计最常发送的时间段
    - [ ] 识别每日规律（早上型/下午型）
    - [ ] 检测周几的不同模式
  - [ ] 最佳提醒时间推荐算法
    - [ ] 基于历史数据计算最佳提醒时间
    - [ ] "您通常在9:30发送，建议将提醒调整到9:15"
  - [ ] 预测性分析
    - [ ] 检测今天可能会错过（超过平时发送时间）
    - [ ] 提前温柔提醒
  - [ ] 提醒频率优化
    - [ ] 分析用户通常在第几次提醒后才发送
    - [ ] 动态调整提醒间隔

- [ ] **智能建议UI** 💡
  - [ ] 设置页面新增"智能建议"卡片
  - [ ] 展示分析结果的可视化图表
    - [ ] 发送时间分布图
    - [ ] 每周发送模式热力图
  - [ ] 一键应用建议功能
  - [ ] 建议解释说明（为什么这样建议）

- [ ] **自适应提醒策略** 🎯
  - [ ] 根据连续记录调整提醒语气
    - [ ] 连续发送：鼓励型文案
    - [ ] 刚断连：温柔安慰型
    - [ ] 长期未发：重新激励型
  - [ ] 个性化提醒频率
  - [ ] 避免打扰的智能判断

### 中优先级

- [ ] **多模板配置文件** 📑
  - [ ] 创建/保存/切换多个模板
  - [ ] 模板标签（站会、周报、计划）
  - [ ] 弹窗中的快速模板选择器
  - [ ] 模板变量（{{date}}、{{day}}、{{week}}）

### 低优先级

- [ ] **统计增强**
  - [ ] 导出统计为 CSV/PDF
  - [ ] 自定义日期范围筛选
  - [ ] 趋势分析图表

---

## v1.3 - AI增强（可选）(2025年Q4)

**主题：AI赋能，用户可选**
**预计开发时间：4-6周**
**核心价值：智能生成，但隐私优先**

### 🤖 AI功能三层架构

**⚠️ 重要原则：**

- 默认使用本地方案（隐私优先）
- 云端AI完全可选（用户自带API key）
- 所有AI功能都可以关闭

#### Layer 1: 本地智能（v1.2已实现，无需AI）

- [x] 用户习惯分析
- [x] 模式识别
- [x] 智能建议

#### Layer 2: 本地轻量AI（可选）

- [ ] **集成 ONNX Runtime** 🔧
  - [ ] 添加 onnxruntime-web 依赖
  - [ ] 准备小型文本生成模型（2-3MB）
  - [ ] 模型优化和量化
  - [ ] 加载和缓存机制

- [ ] **AI文案生成（本地）** ✍️
  - [ ] 基于用户选择的风格生成文案
  - [ ] 每次都是新鲜的，不重复
  - [ ] 考虑上下文（streak、时间、天气）
  - [ ] 质量：中等（受限于模型大小）
  - [ ] 优势：完全本地，零成本，隐私友好

#### Layer 3: 云端AI（高级用户BYOK）

- [ ] **API集成框架** 🌐
  - [ ] 创建 ai/cloudAIService.ts
  - [ ] 支持 Claude API（Anthropic）
  - [ ] 支持 OpenAI API
  - [ ] API key管理（加密存储）
  - [ ] 错误处理和重试机制
  - [ ] 降级策略（API失败时使用本地方案）

- [ ] **智能TODO生成** 📝
  - [ ] 基于日历事件生成TODO
  - [ ] 基于Jira/GitHub任务生成
  - [ ] 综合多个数据源
  - [ ] 用户审核和编辑界面
  - [ ] 学习用户编辑习惯

- [ ] **高级文案生成** 💬
  - [ ] 情感化、个性化文案
  - [ ] 根据用户历史调整语气
  - [ ] 特殊日子的定制文案
  - [ ] 质量：优秀（GPT/Claude级别）

- [ ] **AI配置UI** ⚙️

  ```typescript
  <Card>
    <CardHeader>
      <CardTitle>AI设置（可选）</CardTitle>
      <CardDescription>提升智能程度，但需要API key</CardDescription>
    </CardHeader>
    <CardContent>
      <Select value={aiProvider}>
        <SelectItem value="none">禁用AI</SelectItem>
        <SelectItem value="local">本地AI（隐私优先）</SelectItem>
        <SelectItem value="claude">Claude API（需要key）</SelectItem>
        <SelectItem value="openai">OpenAI API（需要key）</SelectItem>
      </Select>

      {aiProvider !== 'none' && aiProvider !== 'local' && (
        <div className="mt-4">
          <Label>API Key</Label>
          <Input type="password" placeholder="sk-..." />
          <p className="text-xs text-gray-500">
            您的API key仅存储在本地，永不上传
          </p>
        </div>
      )}
    </CardContent>
  </Card>
  ```

### 中优先级

- [ ] **日历集成（需要OAuth）** 📅
  - [ ] Google Calendar集成
  - [ ] 读取今日事件
  - [ ] 生成基于日历的TODO建议
  - [ ] ⚠️ 需要额外权限，谨慎实施

- [ ] **项目管理集成** 🔗
  - [ ] Jira API集成
  - [ ] GitHub Issues集成
  - [ ] Linear集成
  - [ ] 自动拉取今日任务

### 低优先级

- [ ] **AI学习和优化** 🎓
  - [ ] 记录用户对AI生成内容的编辑
  - [ ] 持续优化prompt
  - [ ] A/B测试不同的生成策略

---

**v1.3 风险评估：**

- 隐私风险：中（需要明确告知用户）
- 技术风险：中（API集成复杂度）
- 成本风险：低（用户自带key）
- Chrome Store审核：中（需要额外权限）

**v1.3 缓解措施：**

- 默认禁用AI功能
- 明确的隐私说明
- 用户完全控制
- 降级方案齐全

---

## v2.0+ - 轻量级Agent（谨慎考虑，可能不做）(2026+)

**主题：恰到好处的智能助手**
**预计开发时间：4-6周**
**⚠️ 高风险功能，需要用户调研后再决定**

### ⚠️ 实施前必须完成：

- [ ] **用户需求调研**
  - [ ] 调查问卷：用户真的需要Agent吗？
  - [ ] 访谈至少50个活跃用户
  - [ ] 分析用户痛点：现有功能是否已足够？
  - [ ] 评估风险 vs 收益

### 如果调研结果积极，再考虑实施：

#### 阶段1：上下文感知Agent（最轻量）

- [ ] **Agent基础框架** 🤖
  - [ ] 创建 agents/agentFramework.ts
  - [ ] Agent注册和管理系统
  - [ ] 启用/禁用机制
  - [ ] 权限管理

- [ ] **URL检测Agent** 🔍
  - [ ] 检测用户打开Slack/Teams/邮件
  - [ ] 显示建议："要打开TODO模板吗？"
  - [ ] 用户可选择：打开/忽略/不再显示
  - [ ] 权限需求：tabs（低风险）

- [ ] **时间智能Agent** ⏰
  - [ ] 基于历史模式的智能提醒
  - [ ] "您通常9:30发送，现在9:25了哦~"
  - [ ] 温柔提示，不强制
  - [ ] 权限需求：storage（已有）

#### 阶段2：内容辅助Agent（中等风险）

- [ ] **页面内容感知** 👀
  - [ ] 检测用户在看Jira ticket
  - [ ] 建议："要把这个任务加到今天的TODO吗？"
  - [ ] 仅建议，不自动执行
  - [ ] 权限需求：activeTab（需谨慎）
  - [ ] ⚠️ 可能被用户认为侵入性强

#### 阶段3：协作Agent（高风险，可能不做）

- [ ] **日历Agent**
  - [ ] 需要OAuth授权
  - [ ] 读取今日日程
  - [ ] 生成TODO建议
  - [ ] 权限需求：Google Calendar API
  - [ ] ⚠️ 隐私敏感，审核风险高

- [ ] **项目管理Agent**
  - [ ] Jira/GitHub集成
  - [ ] 自动拉取任务
  - [ ] 权限需求：外部API访问
  - [ ] ⚠️ 复杂度高，维护成本大

### Agent设计原则（如果实施）：

1. **最小权限原则**：只请求必需的权限
2. **默认禁用**：所有Agent默认关闭
3. **透明行为**：Agent做什么，用户都能看到
4. **易于关闭**：一键禁用所有Agent
5. **本地优先**：尽量本地处理，减少网络请求
6. **只建议不执行**：用户保持最终控制权

### Agent管理UI：

```typescript
<Card>
  <CardHeader>
    <CardTitle>智能助手（实验性）</CardTitle>
    <CardDescription>
      Agent在后台工作以提升效率。完全可控，可随时关闭。
    </CardDescription>
  </CardHeader>
  <CardContent>
    {agents.map(agent => (
      <div key={agent.id} className="border rounded p-4 mb-3">
        <div className="flex justify-between">
          <div>
            <h4 className="font-semibold">{agent.name}</h4>
            <p className="text-sm text-gray-500">{agent.description}</p>
            <div className="mt-2 flex gap-2">
              {agent.permissions.map(perm => (
                <Badge variant="secondary">{perm}</Badge>
              ))}
            </div>
          </div>
          <Switch
            checked={agent.enabled}
            onChange={(enabled) => toggleAgent(agent.id, enabled)}
          />
        </div>
      </div>
    ))}
  </CardContent>
</Card>
```

### 风险评估与缓解：

**风险1：权限过多，Chrome Store拒绝审核**

- 缓解：阶段性申请权限，先做最轻量的

**风险2：用户觉得过度侵入**

- 缓解：默认禁用，明确说明，易于关闭

**风险3：维护成本高**

- 缓解：如果用户反馈不好，随时可以砍掉这个功能

**风险4：隐私问题**

- 缓解：本地处理为主，明确隐私政策

### 决策标准：

**只有满足以下条件才实施Agent：**

1. 至少70%的用户表示需要
2. 现有功能确实无法满足需求
3. 隐私和安全风险可控
4. Chrome Store审核概率>80%
5. 维护成本在可接受范围

**如果不满足，则：**

- 专注于v1.1-v1.3的功能
- 做好核心体验（声音+文案+智能分析）
- 不追求过度智能化

---

## 长期想法 (2026+)

**未来版本的头脑风暴：**

- [ ] **移动应用**
  - [ ] iOS 配套应用
  - [ ] Android 配套应用
  - [ ] 桌面和移动端之间同步

- [ ] **Web 版本**
  - [ ] 渐进式 Web 应用（PWA）
  - [ ] 从任何浏览器访问
  - [ ] 同样的隐私优先方式

- [ ] **浏览器支持**
  - [ ] Firefox 扩展
  - [ ] Edge 扩展（基于 Chromium，应该很容易）
  - [ ] Safari 扩展

- [ ] **企业功能**
  - [ ] 团队管理仪表板
  - [ ] 管理员控制
  - [ ] 自定义品牌
  - [ ] SSO 集成
  - [ ] 合规报告

- [ ] **健康功能**
  - [ ] 休息提醒
  - [ ] 补水提醒
  - [ ] 姿势检查提醒
  - [ ] 眼疲劳警告
  - [ ] 与健康应用集成

---

## 技术债务与改进

### 代码质量

- [ ] 将测试覆盖率提高到 80%+
- [ ] 使用 Playwright 添加 E2E 测试
- [ ] 添加视觉回归测试
- [ ] 重构统计计算逻辑
- [ ] 添加性能监控
- [ ] 实现错误边界组件
- [ ] 添加 Sentry 用于生产错误追踪（选择加入）

### 性能

- [ ] 优化包大小（目前可接受，但可以改进）
- [ ] 懒加载统计组件
- [ ] 优化大历史记录的日历渲染
- [ ] 添加 service worker 缓存策略
- [ ] 防抖设置更新

### 文档

- [ ] 为所有函数添加 JSDoc 注释
- [ ] 创建架构决策记录（ADRs）
- [ ] 编写贡献指南
- [ ] 创建视频教程
- [ ] 添加常见自定义的代码示例
- [ ] 记录使用的 Chrome 扩展 API

### DevOps

- [ ] 自动化版本号更新
- [ ] 自动化变更日志生成
- [ ] 添加 release drafter
- [ ] 创建部署检查清单自动化
- [ ] 为商店添加自动截图生成

---

## 社区与开源

- [ ] 创建 GitHub Discussions 讨论板
- [ ] 添加问题模板（bug、功能请求）
- [ ] 创建 PR 模板
- [ ] 添加贡献者指南
- [ ] 创建行为准则
- [ ] 添加安全策略
- [ ] 设置 GitHub Sponsors
- [ ] 创建路线图可视化
- [ ] 每月社区更新
- [ ] 表彰顶级贡献者

---

## 营销与增长

- [ ] 提交到 Product Hunt
- [ ] 在 Reddit 发帖（r/productivity、r/chrome_extensions）
- [ ] 撰写关于构建扩展的博客文章
- [ ] 为 YouTube 创建演示视频
- [ ] 在 Twitter 上发推特宣布发布
- [ ] 在 Hacker News 上发帖
- [ ] 提交到 Chrome Web Store 精选列表
- [ ] 联系生产力影响者
- [ ] 创建着陆页（可选）
- [ ] SEO 优化以提高可发现性

---

## Bug 修复与已知问题

### 高优先级

- [ ] 测试浏览器休眠/重启后的闹钟可靠性（目前工作正常，但需要广泛测试）
- [ ] 验证不同地区的时区处理
- [ ] 测试 90+ 天历史记录的存储配额限制

### 中优先级

- [ ] 改进小屏幕上的 toast 通知定位
- [ ] 更好的导入失败错误消息
- [ ] 处理边缘情况：用户在一天中间更改时区

### 低优先级

- [ ] 超宽屏幕上的轻微 UI 对齐问题
- [ ] 模板内容超长时的滚动条样式需要优化

---

## 用户反馈整合

当用户开始使用扩展时，追踪并优先处理：

- [ ] 用户请求最多的前 5 个功能
- [ ] 报告最多的 bug
- [ ] UX 痛点
- [ ] 翻译改进
- [ ] 性能投诉

---

## 备注

**优先级指南：**

- 高优先级：对用户体验至关重要或经常被请求
- 中优先级：很好拥有，增强体验
- 低优先级：完善、边缘情况或小众用例

**版本规划：**

- v1.x：专注于核心生产力功能
- v2.x：专注于协作和集成
- v3.x：专注于 AI 和高级分析

**开发理念：**

- 隐私优先：任何功能都不应损害用户隐私
- 本地优先：核心功能应该能离线工作
- 开源：所有代码都应该可审计
- 可访问：遵循 WCAG 指南
- 性能：保持扩展轻量级（<2MB）

**维护：**

- 每月审查此 TODO
- 将完成的项目归档到 CHANGELOG
- 根据用户反馈重新确定优先级
- 保持 v1.x 路线图切实可行

---

## 🎯 产品定位与核心价值

### 独特价值主张

> "最有温度的每日例行任务提醒工具"

**我们不是：**

- ❌ 最强大的TODO管理工具（已有Todoist、TickTick）
- ❌ 最智能的AI助手（已有ChatGPT、Notion AI）
- ❌ 最全面的项目管理工具（已有Jira、Linear）

**我们是：**

- ✅ 最懂你的提醒工具（分析习惯，个性化）
- ✅ 最有温度的提醒工具（可爱文案+声音）
- ✅ 最尊重隐私的智能工具（本地优先）

### 差异化竞争优势

1. **情感化体验**（市面上没有）
   - 可爱文案 + 匹配声音 = 情感连接
   - 5种风格满足不同性格用户
   - 每天期待提醒，而不是厌烦提醒

2. **智能但隐私**（竞品二选一）
   - 大部分工具要么不智能
   - 要么智能但不隐私（数据上云）
   - 我们：本地AI分析 + 可选云端

3. **恰到好处的帮助**（不过度自动化）
   - Agent只建议，不自动执行
   - 用户保持控制权
   - 简单 > 复杂

### 目标用户画像

**主要用户群：**

1. **年轻职场人**（25-35岁）
   - 喜欢可爱风格
   - 注重隐私
   - 愿意尝试新工具

2. **远程工作者**
   - 需要自律工具
   - 团队要求每日更新
   - 时区管理需求

3. **开发者/设计师**
   - 技术敏感，看重隐私
   - 愿意深度定制
   - 可能使用BYOK（自带API key）

**非目标用户：**

- 需要复杂项目管理的企业团队（应该用Jira）
- 不接受任何提醒的用户
- 对可爱风格反感的严肃用户（可选专业风格）

---

## 💰 商业化策略

### 免费版 vs 付费版

**免费版（永久免费）：**

- ✅ 基础提醒（通知、Toast、徽章）
- ✅ 3种预置声音
- ✅ 3种文案风格（专业、温柔、激励）
- ✅ 基础统计（30天历史）
- ✅ 本地数据分析（提醒时间优化）
- ✅ 键盘快捷键
- ✅ 多语言支持

**Pro版（$2.99/月 或 $29/年）：**

- ✨ 所有声音效果（10+种）
- ✨ 所有文案风格（5+种）
- ✨ 自定义声音和文案
- ✨ AI文案生成（本地模型）
- ✨ 无限历史记录
- ✨ 高级统计和图表
- ✨ 导出数据为PDF
- ✨ 优先客服支持
- ✨ 提前体验新功能

**AI增强包（$4.99/月，可选）：**

- 🤖 云端AI（使用我们的API key）
- 🤖 智能TODO生成
- 🤖 日历集成
- 🤖 Jira/GitHub集成
- 🤖 每月500次AI调用
- 💡 或者BYOK（用户自带key，免费使用所有AI功能）

**企业版（$9.99/用户/月）：**

- 📊 包含Pro的所有功能
- 📊 团队模板共享
- 📊 团队统计仪表板
- 📊 管理员控制台
- 📊 SSO集成
- 📊 API访问
- 📊 专属客服

### 盈利预测

**假设场景：**

- 1年后达到10,000个用户
- 10%转化为付费用户（1,000人）
- 其中：
  - 700人选Pro（$2.99/月）
  - 200人选AI包（$4.99/月）
  - 100人选企业版（$9.99/月）

**月收入计算：**

- Pro: 700 × $2.99 = $2,093
- AI包: 200 × $4.99 = $998
- 企业: 100 × $9.99 = $999
- **总计: $4,090/月 ≈ $49,000/年**

**成本估算：**

- 服务器（如果提供AI服务）：$200/月
- 开发维护时间：自己投入
- 营销费用：$500/月
- **净利润: 约$3,400/月 ≈ $40,000/年**

### 定价策略

1. **早期用户优惠**
   - 前1000名用户：终身Pro $1.99/月
   - 建立忠诚度

2. **年付折扣**
   - Pro月付 $2.99，年付 $29（省20%）
   - 锁定用户，稳定收入

3. **学生优惠**
   - 学生认证后50%折扣
   - 培养未来付费用户

4. **推荐计划**
   - 推荐1个付费用户，双方各得1个月免费Pro
   - 病毒式增长

---

## 🚀 立即行动计划

### 本周可以开始的工作（v1.1第一步）：

#### 任务1：准备音效文件（1-2天）

**行动清单：**

- [ ] 访问 Freesound.org
- [ ] 搜索并下载9个音效：
  - [ ] 专业风格：gentle-bell.mp3, email-ding.mp3, urgent-beep.mp3
  - [ ] 可爱风格：cute-bell.mp3, cat-meow.mp3, playful-alarm.mp3
  - [ ] 极简风格：minimal-click.mp3, tick.mp3, simple-beep.mp3
- [ ] 使用Audacity或在线工具压缩到<50KB
- [ ] 放入 `public/sounds/` 目录

**推荐音效关键词：**

- 柔和：soft notification, gentle bell, subtle ding
- 标准：email notification, message pop, standard alert
- 紧急：urgent alert, warning beep, alarm sound
- 可爱：cute bell, cat meow, playful chime

#### 任务2：创建文案库（2-3天）

**行动清单：**

- [ ] 创建 `src/constants/messageTemplates.ts`
- [ ] 为每种风格编写20条中英文文案
- [ ] 覆盖4种场景：首次、重复、迟到、很迟
- [ ] 支持变量替换（{{streak}}、{{time}}等）

**示例结构：**

```typescript
export const MESSAGE_TEMPLATES = {
  cute: {
    first: {
      en: [
        "Hi there! Time to write today's plan! 🌸",
        'Good morning! Ready to plan your day? ✨',
        // ... 18 more
      ],
      zh: [
        '主人早上好呀~ 该写今天的计划啦 🌸',
        '新的一天开始了，规划一下吧！✨',
        // ... 18 more
      ],
    },
    // ... repeat, late, veryLate
  },
  // ... professional, motivational, humorous, minimal
}
```

#### 任务3：实现核心模块（1周）

**soundManager.ts 框架：**

```typescript
class SoundManager {
  private audio: HTMLAudioElement | null = null
  private volume: number = 70

  async play(style: string, urgency: string): Promise<void> {
    const soundPath = SOUND_PRESETS[style][urgency]
    this.audio = new Audio(chrome.runtime.getURL(soundPath))
    this.audio.volume = this.volume / 100
    await this.audio.play()
  }

  setVolume(volume: number): void {
    this.volume = volume
  }
}
```

**messageStyleManager.ts 框架：**

```typescript
class MessageStyleManager {
  getRandomMessage(
    style: string,
    context: 'first' | 'repeat' | 'late' | 'veryLate',
    variables: Record<string, any>,
  ): { en: string; zh: string } {
    const messages = MESSAGE_TEMPLATES[style][context]
    const randomEn = messages.en[Math.floor(Math.random() * messages.en.length)]
    const randomZh = messages.zh[Math.floor(Math.random() * messages.zh.length)]

    return {
      en: this.replaceVariables(randomEn, variables),
      zh: this.replaceVariables(randomZh, variables),
    }
  }

  private replaceVariables(text: string, vars: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '')
  }
}
```

### 下周开始的工作：

- [ ] UI组件开发（风格选择器、音量控制）
- [ ] 集成到现有提醒系统
- [ ] 测试和优化
- [ ] 用户测试（邀请10个朋友试用）

---

## 📌 核心原则（时刻提醒自己）

1. **温度 > 功能**
   - 宁可少一个功能，也要做出温度

2. **隐私 > 智能**
   - 宁可不够智能，也不能泄露隐私

3. **简单 > 复杂**
   - 宁可功能简单，也不能让用户困惑

4. **用户控制 > 自动化**
   - 宁可让用户多点一下，也不能自作主张

5. **质量 > 速度**
   - 宁可晚一点发布，也要确保质量

**成功的标志：**

- 用户评价："这个扩展太可爱了，每天都期待它的提醒！"
- 而不是："这个扩展功能好多啊"

---

最后更新：2025-01-17

**下一步行动：立即开始v1.1 - 声音提醒 + 文案风格系统！**
