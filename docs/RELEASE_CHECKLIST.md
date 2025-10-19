# 发布前最终检查清单

在将 Routine Reminder 提交到 Chrome Web Store 之前，请按照以下步骤逐项确认。配合 `TODO.md` 与 `MANUAL_TEST_CHECKLIST.md` 可以快速完成发布准备。

---

## 1. 自动化校验

1. `pnpm install`
2. 运行 `pnpm run release:prep`
   - 依次执行类型检查、ESLint、Prettier 校验以及构建流程
   - 若任一步骤失败需先修复再继续

成功后确认 `dist/` 中的产物已更新。

---

## 2. 手动回归（覆盖 TODO.md:39-46）

| 检查项       | 验证方式                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------- |
| 键盘快捷键   | 在 Windows（Ctrl）与 macOS（Command）分别触发 `_execute_action`、`mark-as-sent`、`open-options` |
| 不同时区     | 在系统设置中切换至少一个非本地时区，确认提醒时间与统计无偏移                                    |
| 导入/导出    | 使用 Options 页的导入导出功能，校验导出文件内容与导入结果一致                                   |
| 多标签页通知 | 打开 2-3 个普通网页，等待提醒触发，确认每个标签都会展示 toast                                   |
| 连续记录     | 通过修改系统日期或手动写入 `storage.local`，验证 streak 计算正确                                |
| 语言切换     | 在 Options 中切换中/英文，确认文案与模板自动同步                                                |

> 建议每项测试完成后在 `MANUAL_TEST_CHECKLIST.md` 对应位置勾选并记录备注，方便归档。

---

## 3. 发布素材自检

- 确认 `assets/store/` 下的宣传图使用最新版 UI
- 若需要提升品牌识别度，可在宣传图中加入“Routine Reminder”字样的文字 Logo
- 若更新了图标，执行 `python3 scripts/generate_icon.py` 重新生成全部尺寸

---

## 4. 打包与版本标签

1. 运行 `pnpm run build`
2. 将 `dist/` 目录压缩为 `routine-reminder-vX.Y.Z.zip`
3. 更新 `CHANGELOG.md`（如果有新增改动）
4. 创建并推送 Git 标签：
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

---

## 5. 清单自查

- `manifest.json` 中仅声明 `http/https` 域的 `host_permissions`
- `web_accessible_resources` 只暴露 `assets/*` 与 `src/assets/icons/*`
- `dist/manifest.json` 已与源码保持一致（建议重新运行构建以生成最新文件）

完成以上步骤后，即可提交 Chrome Web Store 审核。祝发布顺利！
