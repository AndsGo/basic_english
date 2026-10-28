# 绘本方案实施进度

本轮按既定设计完成 52 篇主线和 open 补充篇，逐批提供可读内容、插画、语义说明、理解题及表达练习。850 词索引保留主学、复习、正文出现和待补支线的区别。

## 完成标准

- 53 篇都来自 curriculum.json 中相应词义的设计，逐篇四页；既有四篇 ID 保留。
- 所有正式页面使用经过检查的 512×512 插画，无占位图，无图片内文字或示意图。
- 需要记录、比较、时间或条件说明的页面提供可访问的网页文字。
- 英文标题、释义、正文、替代文本、题目、反馈和参考表达通过现有词汇政策。
- 理解题、自由表达和已读记录独立保存；需要复习时接入现有单词复习队列。
- 校正设计中标记的 31 个词条，核对释义、中文、例句、音标及分类。
- 完成桌面、320px 手机、中文帮助、自动朗读、复习与已认识操作的回归检查。
- 850 词索引与最终脚本一致，保留尚需支线的真实状态。

## 最终核验：2026-10-28

本轮 52 篇主线与 open 补充篇已全部完成，应用入口为 Words → Stories。

| 完成项 | 结果与证据 |
| --- | --- |
| 内容接入 | 53/53 篇、212 页；四篇既有 ID 保留，交付状态无剩余篇目。 |
| 插画 | 207 张独立正式插画全部为 512×512，素材清单中的每页均已检查；无未引用正式图片。逐批风格与四页联系表见下文。 |
| 语义说明 | 记录、数量、时间、信件、条件及 so / because 对照以可访问 HTML 呈现，插画内不嵌入教学文字。 |
| 内容校验 | `stories:build` 与 `stories:audit` 通过；53 篇脚本词汇、复习顺序及读前支持无错误。 |
| 单元测试 | `npm test`：48 个文件、585 项通过，覆盖内容、词条校正、逐篇下一页自动朗读、独立阅读记录、句子保存、复习与已认识流程。 |
| 浏览器检查 | 全套 22 项均通过：首轮 20 项通过，另外 2 项的句首大小写断言修正后重跑通过。桌面和 320px 手机逐篇遍历全部 53 篇四页，检查图片尺寸、导航稳定、溢出、目标词高亮及理解题；另含中文开关、语音关闭、阅读记录和学习主流程。 |
| 构建与课程 | 生产构建通过；`content:health` 无错误。原有第 2 至 4 周的 4 条学习量提示，以及主包约 689 kB 的体积提示仍保留。 |
| 850 词范围 | 主学 52、复习 82、仅正文 92、仅题目或输出 45、待补支线 579，共 850。52 个核心目标加补充词 repeat 构成本轮 53 篇；待补池不算已教会。 |

最终人工查看了 [so 手机对照句](../iterations/story-final-so-mobile.png)、[news 手机信件](../iterations/story-final-news-mobile.png)、[why 手机长句](../iterations/story-final-why-mobile.png) 与 [if 桌面条件页](../iterations/story-final-if-desktop.png)。英文标题、单词与音标、播放按钮、中文帮助、网页说明和导航均可见，未出现横向溢出。以上为内容及工程验收记录，未声称完成真实学习者试教。

## 当前批次

阅读功能已接入读前提示、独立理解题记录、句子保存和朗读、加入复习以及页面语义文字。新绘本按完整四页的插画审核状态进入阅读列表。

第一阶段的第 1 至 12 周主线和 open 补充篇已完成四页插画审核并接入，共 13 篇、48 张独立插画。because 按原因表达复用 give 的相关画面。repeat、rest、family、rain、record、will 的第 2 至 4 页对照检查见 [插画检查表](../iterations/story-first-stage-review.png)；逐页原图路径和提示词保存在 generated 目录。该阶段完成时，其余 40 篇为待完成插画的内容设计稿。

本批核验：53 篇脚本的词汇、课程顺序与读前支持校验无错误；绘本内容和阅读组件的 60 项测试通过；桌面与 320px 手机的 6 项浏览器测试通过，逐页检查 13 篇图片尺寸、导航位置、溢出与理解题；TypeScript 构建检查通过。

第二阶段第 13 至 20 周的 cat、cloth、middle、equal、shade、pocket、soup、drawer 已完成接入，总计 21/53 篇可读、80 张独立插画。新图与原有 give 样图的 [风格对照](../iterations/story-weeks13-20-style-check.png) 及 [四页连续性检查表](../iterations/story-weeks13-20-contact.png) 已检查；equal 的两组数量另有网页比较记录。图片由内置 imagegen 工具生成，提示词与原图来源保存在 generated 对应文件，正式素材在 src/assets/word-stories/。

第二批核验：84 项绘本内容及阅读组件测试、6 项桌面和 320px 手机浏览器测试通过，遍历全部 21 篇正式绘本四页；生产构建通过，保留原有主包体积提示。查看了 middle 与 equal 的手机截图。内容审核补充每篇 3 至 5 个复习词、至少 3 个在正文或语义说明中实际使用的约束；cat、middle、loss、receipt、why 的复习列表已据此调整，53 篇完整脚本校验无错误。

第三批第 21 至 28 周的 while、example、selection、cause、purpose、loss、rule、journey 已完成接入，总计 29/53 篇可读、111 张独立插画。本批新增 31 张，loss 开篇沿用 pocket 的持钥匙画面，其余三页通过寻找和未找到表达失去。检查了 [风格对照](../iterations/story-weeks21-28-style-check.png) 和 [四页连续性检查表](../iterations/story-weeks21-28-contact.png)；journey 第 3 页修正了行驶公交缺少司机的问题，保留了修改前来源与编辑提示词。

第三批核验：108 项绘本内容及阅读组件测试、6 项桌面和 320px 手机浏览器测试通过，遍历全部 29 篇正式绘本四页；生产构建通过，保留原有主包体积提示。查看了 while 和 cause 的手机截图。53 篇完整脚本的词汇、课程顺序与读前支持校验无错误。

第四批第 29 至 36 周的 group、dirty、dry、art、distance、growth、support、opinion 已完成接入，总计 37/53 篇可读、143 张独立插画。检查了 [风格对照](../iterations/story-weeks29-36-style-check.png) 和 [四页连续性检查表](../iterations/story-weeks29-36-contact.png)。修正了 art 末页画作与前页不一致、distance 到达学校画面混入近家商店的问题；修改来源和提示词保存在对应 generated 文件。growth 通过图片外的时间标签及固定的围栏、人物和石头参照表现生长，dirty 保持人物肤色一致并以附着泥土表现脏。

第四批核验：132 项绘本内容及阅读组件测试、6 项桌面和 320px 手机浏览器测试通过，遍历全部 37 篇正式绘本四页；生产构建通过，保留原有主包体积提示。查看了 growth 和 distance 的手机截图。53 篇完整脚本校验无错误，正式图片无未引用文件。第 21 至 36 周阶段已完成，剩余第 37 至 52 周共 16 篇。

制作第 37 至 52 周时同步补齐语义文字：seed 的时间经过、observation 的可见事实与可能解释、parcel 的虚构寄送信息、news 的昨天情境与信件引用均放在网页，插画不嵌入文字。各篇在四页素材审核通过后计入正式可读绘本。

第五批第 37 至 44 周的 river、seed、across、receipt、pull、solid、observation、parcel 已完成接入，总计 45/53 篇可读、175 张独立插画。检查了 [风格对照](../iterations/story-weeks37-44-style-check.png) 和 [四页连续性检查表](../iterations/story-weeks37-44-contact.png)。river 与 across 保持河段、桥和人物一致；seed 在数日后才长出幼苗；solid 保持同一块石头，用不同形状容器内的水作比较。observation 区分直接观察和可能原因，receipt、parcel 的记录均在图片外。

第五批核验：156 项绘本内容及阅读组件测试、6 项桌面和 320px 手机浏览器测试通过，遍历全部 45 篇正式绘本四页；生产构建通过，保留原有主包体积提示。查看了 observation 和 receipt 的手机截图。剩余第 45 至 52 周共 8 篇。

第六批第 45 至 52 周的 news、between、slow、if、thread、but、so、why 已完成接入，总计 53/53 篇、212 页、207 张独立插画。检查了 [风格对照](../iterations/story-weeks45-52-style-check.png) 与 [四页连续性检查表](../iterations/story-weeks45-52-contact.png)。between 保持椅子和窗的双参照；if 区分今天的两种计划与次日实际行动；thread 由成年人操作并收好针；so 另有 because 对照句；why 结尾修正重复出现同一本书的问题，保留原候选与编辑来源。

实际内容数量和逐篇剩余项目见 [交付状态](delivery-status.json)。该文件由 `npm run stories:build` 根据脚本、素材清单和实际文件生成；计划中的脚本不会因已录入目录而自动算作交付。

`npm run stories:audit` 校验整套脚本的词汇、复习词可用阶段、读前支持，并重新生成 850 词索引及覆盖计数。

实施顺序：第 1 至 12 周 → 第 13 至 20 周 → 第 21 至 36 周 → 第 37 至 52 周。全部主线及 open 补充篇均已接入；历史批次的“剩余”数字仅表示该批结束时的状态。

## 内容与素材来源

- [curriculum.json](curriculum.json)：教学内容设计。
- [assets-manifest.json](assets-manifest.json)：逐页文件、替代文本和审核状态。
- generated 目录：新素材的生成提示词、原始路径和选定版本。
- [storybookCatalog.json](../../src/content/storybookCatalog.json)：供应用使用的目录，由构建脚本生成。
- [词条校正数据](../../src/content/storyWordCorrections.json)：课程组装时应用的 31 个词条修订；词条 ID 与学习进度保持一致。

音标采用英音编辑稿；复杂词核对参考 Cambridge 的 [drawer](https://dictionary.cambridge.org/us/pronunciation/english/drawer)、[while](https://dictionary.cambridge.org/us/pronunciation/english/while)、[example](https://dictionary.cambridge.org/pronunciation/english/example)、[selection](https://dictionary.cambridge.org/us/pronunciation/english/selection)、[cause](https://dictionary.cambridge.org/pronunciation/english/cause)、[purpose](https://dictionary.cambridge.org/pronunciation/english/purpose)、[opinion](https://dictionary.cambridge.org/us/pronunciation/english/opinion)、[observation](https://dictionary.cambridge.org/pronunciation/english/observation)。释义与例句沿用本项目的受控词汇政策和已审阅脚本。
