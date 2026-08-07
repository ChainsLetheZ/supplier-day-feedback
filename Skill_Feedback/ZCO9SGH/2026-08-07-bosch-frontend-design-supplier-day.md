# Skill Feedback

- Author: ZCO9SGH
- Date: 2026-08-07
- Skill Used: bosch-frontend-design
- Topic: supplier-day-frontend-branding
- Project: feedback collection / Bosch China Supplier Day

## Task Summary

将供应商大会移动问卷按 Bosch Digital Design System 重新整理，覆盖品牌页头、交互色、字体引用、响应式结构和无障碍状态，同时保留既有问卷流程与 Dashboard 功能。

## Initial Output Gaps

- 初始实现把 Bosch 红误判为全局主操作色；用户指出 frontend-design 并没有这样的规则。
- 首次寻找 skill 时误找了 open-design 版本，没有定位到项目内 GS-UX-Team-Skill-Library 的 `bosch-frontend-design`。
- 项目没有现成 Bosch Sans 字体文件，原代码还依赖 Google Fonts 外链，与本地规范要求不一致。

## Natural Language Fixes

- 用户明确要求使用 `003_Project Files` 内的新 skill；随后定位并读取 `GS-UX-Team-Skill-Library/skills-src/bosch-frontend-design` 及其本地参考。
- 根据本地 BDDS 参考把主交互色改为 Bosch Blue `#007bc0`，将红色限制为品牌/错误语义，并移除 Google Fonts 外链。
- 复制 skill 中经授权的 Bosch Logo 与响应式 Supergraphic 到项目 `public/brand/`，作为页面顶部品牌页头资产。

## Acceptable Final Pattern

- 交互主色遵循 BDDS Accent Blue，红色不承担普通 CTA 语义。
- 页面顶部使用批准的 Logo 和 Supergraphic，保留原始比例与安全区。
- 视觉 tokens 集中在 CSS 变量中，问卷移动端保持响应式、键盘焦点和触摸目标。
- Persona 徽章仍保留各自的 Turquoise / Purple / Blue / Green 视觉识别，不与页面主交互色混用。

## Recommended Skill Update

- 在 skill 的快速开始部分增加“先确认项目内 skill 路径，再读取本地参考”的示例，避免同名 open-design skill 被误选。
- 增加“品牌红不是默认 CTA 色”的显式反例，并在色彩选择前要求引用 Accent 语义 token。
- 提供 Bosch Sans 字体资产可用性检查脚本或明确的项目缺失处理模板；未获得字体文件时不要声称完全符合 BDDS。
- 增加 React/Tailwind 既有项目的迁移示例，说明如何以 scoped token overrides 渐进替换旧的 indigo/purple 视觉。

## Reusability Decision

- Suggested for team-wide rule: yes
- Why: “品牌识别色”和“交互语义色”容易被混用；这次修正对其他 Bosch Web 项目同样适用。

## Notes

- 已运行 `npm run lint`、`npm run build` 和 `git diff --check`，均通过。
- 由于目标项目未提供 Bosch Sans WOFF/WOFF2 文件，本次使用 `Bosch Sans` 优先、系统无衬线 fallback；这是待补齐的品牌合规项。
