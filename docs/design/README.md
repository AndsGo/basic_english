# Basic English 设计方案交付

状态：已于 2026-10-28 采纳为后续页面新增与改造的统一规范，并在 [AGENTS.md](../../AGENTS.md) 中设为协作要求。设计与验收以 DESIGN.md 正文为准，预览用于说明视觉和交互意图。

色彩版本：1.1。基础色彩已同步至应用 styles.css 和交互预览。2026-10-29 已将页面规范接入正式应用代码，包括导航、五个主页面的层级、封面目录、读前页和专注阅读布局；实现范围与实际页面截图见 [应用改造记录](implementation/README.md)。原生控件跟随主题，深色主按钮采用柔和鼠尾草绿与深色文字，导航、答案和播放状态使用独立的低亮度强调层。详情见 [色彩调整与对照](theme-review/README.md)。

[完整设计规范](../../DESIGN.md) 以 Claude 的阅读层级为参考，延续 Basic English 的暖白与深绿，并使用封面组织绘本目录。规范包括品牌语气、颜色、字体、间距、导航、五个主页面、阅读器、状态、无障碍、响应式布局、组件接入与实施验收，共 20 个部分。

## 打开与操作预览

用浏览器打开 [preview.html](preview.html)。所有插画与脚本都在本仓库中，预览无需联网或安装字体。

顶部工具栏可选择绘本目录、绘本阅读、Today、Course、Review、Me、色彩与组件，并切换桌面、390px、320px、深色与中文帮助。长目录可在设备框内滚动；长阅读页可在正文区滚动，翻页导航保持位置。

可以直接尝试：搜索 give、筛选 Read、选择 Weeks 37–52、点击封面进入读前页、翻完四页、重试理解题、写一句自己的表达。播放控件展示播放和停止状态，不播放真实声音。

## 设计画面

| 画面 | 查看 |
| --- | --- |
| 封面目录 桌面 | [预览图](previews/stories-desktop.png) |
| 封面目录 手机 | [首屏](previews/stories-mobile.png) · [封面与书名](previews/stories-mobile-covers.png) |
| 320px 与中文帮助 | [预览图](previews/stories-narrow.png) |
| 阅读器 桌面 | [预览图](previews/reader-desktop.png) |
| 阅读器 手机 | [预览图](previews/reader-mobile.png) |
| 深色与语义说明 | [阅读首屏](previews/reader-dark-mobile.png) · [正文区滚动后](previews/reader-dark-record.png) |
| Today | [预览图](previews/today-desktop.png) |
| Me 深色 | [预览图](previews/me-dark-mobile.png) |
| 色彩与组件 | [预览图](previews/design-system.png) |

## 检查结果与范围

已检查 7 个预览页面在桌面、390px、320px、深浅主题和中文开关组合下的 84 种布局，未发现横向溢出或浏览器运行错误。另检查 give、so、seed 的 72 个正文页组合，图片保持正方形，同一配置切页的导航位置差小于 2px。搜索、已读筛选、阶段筛选、无结果清除、四页阅读、题目反馈、表达保存提示和独立已读标记均已操作检查。

检查记录见 [preview-review.json](preview-review.json)。上述结果仅针对独立设计预览；正式应用改版后仍需运行其完整测试与回归检查。

预览的书架为 8 本真实脚本样例，课程路径、学习数量与个人进度为示意状态；未接入完整的 850 词检索、课程执行、复习调度、真实语音与麦克风。预览不读写应用学习存储，输入仅在当前页面会话中保留。

## 文件与后续接入

- [DESIGN.md](../../DESIGN.md)：后续实施依据。
- [preview.html](preview.html)：独立交互预览与视觉样式。
- [preview-data.js](preview-data.js)：从现有绘本目录抽取的样例正文和素材引用；不是应用的新内容来源。
- previews 目录：检查后的画面。

正式实现继续读取 storybookCatalog.json、wordStories.ts 和现有进度仓库。按规范中的四阶段顺序推进，避免把预览中的示意状态或样例数组复制进生产逻辑。
