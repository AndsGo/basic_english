# Basic English 850 配套绘本课程设计

本项目的绘本应帮助学习者用有限词汇理解并表达日常生活。一篇围绕一个目标词的一个常用词义，让人物有具体需要、采取行动、产生变化，读后用同一语言完成一次自己的表达。

整套 53 篇已完成制作并接入 Words → Stories。内容、素材来源与检查记录见 [实施进度](execution-plan.md)，逐篇状态见 [交付状态](delivery-status.json)。

本稿提供 **52 篇主线、1 篇现有补充篇，共 212 页正文**，与现有 52 周课程衔接。最初实现的 give、under、open、because 作为内容与画风基准；后续篇目按课程顺序制作，实际可读篇目见交付状态。主线周次是课程关联，建议阅读周次同时考虑背景词。because 的现有第 4 周版本可作提前接触，第 11 周用同篇完成原因表达复习。

## 面向的学习者与内容风格

以中文母语的成人与青少年零基础学习者为默认对象。场景包括家、学习室、商店、公交、办公室、花园与社区。采用温暖卡通，但人物有真实需要，句子自然、内容尊重学习者；儿童只在适合家庭和学校的情节中出现。

人物与场景可以复现。Li 与 Anna 可作为学习伙伴，红衣人物承担居家找物，黄衣人物承担阅读与制作；工作、购物、照护场景使用相应年龄的人物。每篇一次固定叙述视角，不让 I、you、he、she 在未说明时改变指代。

## 每篇的教学合同

| 项目 | 制作要求 |
| --- | --- |
| 核心学习 | 一个目标词、一个明确词义。多义词的其他意义另作支线。 |
| 复习 | 3 至 5 个有上下文支持的词；读前能查看释义和朗读，不能假定用户全部掌握。 |
| 叙事 | 场景与需要 → 发现问题或差异 → 关键行动或关系 → 结果与一句表达。说明型主题也要保留观察的推进。 |
| 正文 | 每页 1 至 2 个短句。前期优先一页一个动作，后期可有原因、条件或对比。少数后期页面较长，排版时需保留原意并检查手机断行。 |
| 插画 | 每页一幅 512×512 完整场景。温暖、具体、有体积、柔光和阴影；不能用图标或文字卡代替故事。 |
| 语义 | 词义需要记录、比较或逻辑解释时，使用网页文字与可访问记录，艺术图只表现生活情境。 |
| 理解 | 一道有明确上下文和唯一答案的题。迁移到新物品或情境，检查意义，不只问单词拼写。 |
| 表达 | 一个可替换句型与一个参考表达，接受多种合理答案。 |
| 记录 | 读过、理解题结果、单词掌握分别记录；读完不自动等于掌握。 |

目标词不必机械地每页出现。前两页可以建立需要，关键页和结果页承担教学；不能为凑出现次数写不自然句子。可见名词也要有行动或用途，关系词要有明确参照，抽象词要有事件和短句共同解释。

## 与 850 词边界和课程顺序的关系

英文标题、释义、正文、题目、反馈、输出句型和示例均使用项目现有校验政策，不新增允许词。数字用阿拉伯数字，正文不含图中文字。repeat 属于项目已有允许的补充词，单独记录，不计入核心词头覆盖。

词条的 weekIntroduced 不能单独决定可读时间。例如 a、the、who 等词在后期词条中登记，却已在前期句型出现。难度审查应同时看课程例句、使用过的句型和读前支持。validation-report.json 列出正文中比现有课程上下文更早出现的核心词，供制作时处理。处理方式是改写句子、提供读前支持或延后阅读，不把所有词表允许词都当作用户已学会。

850 词仍由现有课程逐步教授。绘本以 52 个重点词义搭起主线，再按词义索引补充支线。当前核心词按最高角色去重后为：主学 52、读前复习 82、仅正文出现 92、仅题目或输出出现 45、待补绘本 579。这些角色合计 850；出现过不代表掌握，也不代表所有词义已覆盖。

## 四个阅读阶段

| 周次 | 叙事范围 | 语言任务 | 画面重点 |
| --- | --- | --- | --- |
| 1 至 12 | 人物、居家、日常、出行、需要与简单计划 | 指认、定位、请求、解释一个原因、表达将来 | 同一物品与人物的连续变化 |
| 13 至 20 | 动物、清洁、位置、数量、光照、衣物、食物与收纳 | 描述物品的特征、用途和关系 | 真实物品和可见差异，减少无关细节 |
| 21 至 36 | 同时活动、举例、选择、原因、目的、规则、观点与帮助 | 从事件里说关系，区分事实与观点 | 人物行为加简短说明，抽象词不靠象征图 |
| 37 至 52 | 自然、移动、交易、材料、观察、信息与逻辑 | 描述过程，解释原因和条件，完成短故事 | 时空、对象、材料状态与语言指代一致 |

## 52 篇主线目录

| 关联周 | 主学词 | 绘本 | 读后能做什么 |
| --- | --- | --- | --- |
| 1 | friend | 我的新朋友 | 介绍现实中的一位朋友；不要求使用真实姓名。 |
| 2 | under | 书包在哪里 | 用家中另一样物品说一个位置句子。 |
| 3 | give | 给朋友一本书 | 替换成笔、杯子等物品，表达给的对象。 |
| 4 | enough | 两个人的食物 | 说清楚什么足够、足够做什么，不能只背数量。 |
| 5 | left | 去商店的路 | 以自己当前朝向描述左边的一个真实物品。 |
| 6 | repeat | 请再说一遍 | 模拟没听清一句话时，礼貌请求对方重复。 |
| 7 | rest | 休息一会儿 | 说出自己在什么活动后需要休息。 |
| 8 | family | 家人在一起 | 介绍一位家人；允许使用虚构家庭，不强求披露个人经历。 |
| 9 | rain | 天空落下的水 | 描述一处正在下雨的具体场景。 |
| 10 | record | 把工作记下来 | 写下一项今天做过的事，作为可再次查看的文字记录。 |
| 11 | because | 朋友为什么高兴 | 给出一个自己的原因；合理原因不只一个。 |
| 12 | will | 明天去花园 | 说一项明天的计划；计划表达不等于未来必定发生。 |
| 13 | cat | 家里的小猫 | 描述猫的一个位置或正在发生的动作。 |
| 14 | cloth | 擦干净桌子 | 说清楚布在这个场景中的用途。 |
| 15 | middle | 杯子放在中间 | 必须说出“什么的中间”，使参照范围明确。 |
| 16 | equal | 一样多 | 比较两组可数物品；不把大小和数量混为一谈。 |
| 17 | shade | 树下乘凉 | 找到一个被物体遮住直射阳光的地方。 |
| 18 | pocket | 外套口袋里的钥匙 | 说一种适合放入口袋的小物品。 |
| 19 | soup | 一碗热汤 | 用一个已学形容词描述汤，不推断营养或医疗功效。 |
| 20 | drawer | 笔的收纳位置 | 说明自己的一个抽屉存放什么。 |
| 21 | while | 同一段时间 | 描述两个能同时发生的活动。 |
| 22 | example | 给我一个例子 | 换一组已知的类别与实例，避免只会重复水果。 |
| 23 | selection | 选一个茶杯 | 从两件实际物品中选择一件，再说出选择结果。 |
| 24 | cause | 纸为什么动了 | 说出一个有明确联系的原因和结果，允许用 because 辅助解释。 |
| 25 | purpose | 为什么带上袋子 | 解释一个日常动作想达到的目标。 |
| 26 | loss | 钥匙不见了 | 描述一个虚构的小物品丢失，不强迫分享私人损失。 |
| 27 | rule | 图书馆里的规则 | 为一个明确场景说明一条合理规则，不把个人偏好当所有地方的规则。 |
| 28 | journey | 从家到集市 | 说清楚一段行程的起点和终点。 |
| 29 | group | 一起做事的一组人 | 介绍一组人的成员数和共同活动。 |
| 30 | dirty | 做完园艺之后 | 说一个具体物品的状态及合理处理。 |
| 31 | dry | 把布晾干 | 描述具体物品的干燥状态，不把 dry 等同于 clean。 |
| 32 | art | 给墙上画幅画 | 画一幅小画，并用一句英语说它表达什么。 |
| 33 | distance | 离家多远 | 明确两个端点，再描述距离，不只说 near 或 far。 |
| 34 | growth | 小树长大了 | 说一种随时间长大的植物，不把搬近镜头当生长。 |
| 35 | support | 帮忙提重袋子 | 提出一种具体、可实行的帮助方式。 |
| 36 | opinion | 每个人有自己的看法 | 给出一个看法和理由，允许不同答案。 |
| 37 | river | 沿着河边走 | 描述河与周围一个具体地点的关系。 |
| 38 | seed | 从一粒种子开始 | 指出一种由种子长成的植物；不声称每颗种子必定发芽。 |
| 39 | across | 到另一边去 | 描述一条安全、明确连接两侧的路径。 |
| 40 | receipt | 付款之后的一张纸 | 根据一份明确示例收据说清楚付款对象。 |
| 41 | pull | 把抽屉拉开 | 用轻小物品安全示范拉的方向。 |
| 42 | solid | 石头和水 | 指出一种熟悉的固体，避免把“很硬”当固体定义。 |
| 43 | observation | 先观察再判断 | 先描述能看见的事实，再另外提出可能的解释。 |
| 44 | parcel | 寄给远方的一本书 | 说明一个包裹里装有什么，以及要送给谁。 |
| 45 | news | 朋友来信了 | 转述一条虚构或真实的简单消息，不要求分享私人信息。 |
| 46 | between | 花盆放在哪里 | 完整说出目标物和两个参照物。 |
| 47 | slow | 端杯子慢一点 | 说一个适合放慢动作的场景，不把慢等同于不好。 |
| 48 | if | 看天气做计划 | 给一项明确条件和相应计划；允许另一个合理的个人计划。 |
| 49 | thread | 把纽扣缝回外套 | 说出线的用途；可以只描述画面，不实际操作针具。 |
| 50 | but | 小袋子也能派上用场 | 说两件有真实转折关系的事，不是任意两句都接 but。 |
| 51 | so | 下雨后改变计划 | 先说原因再说结果，再尝试改为 because 表达同一关系。 |
| 52 | why | 告诉我原因 | 自己提出一个 why 问题，再用有意义的原因回答。 |

open 的现有四页《盒子里有一本书》保留为第 3 周补充篇，用于与 give 并行学习动作变化。全部主线与补充篇的逐页英文、中文、画面、题目和参考表达见 [逐篇内容](story-outlines.md)。

## 语义家族的支线原则

| 家族 | 优先补充的词 | 教学方式与验收重点 |
| --- | --- | --- |
| 所有与指代 | my、your、this、that | 明确谁在说话、谁拥有物品、远近由谁判断；不只在同一物体旁换关键词。 |
| 位置 | in、on、under、near、between、across | 固定物体和参照，隔离位置或移动关系；保留完整参照物。 |
| 操作与结果 | have、get、put、take、go、make、do、keep、let | 事件前后状态明确，一次只教一个常用用法；不把不同操作词都配成拿东西的同一画面。 |
| 频率 | always、usually、often、sometimes、never | 五词同批试教，同一种活动、可比的多个场合、文字解释。记录区分发生、未发生、无记录；样本只描述限定情境，不用固定百分比定义 usually、often、sometimes，不对重叠用法强制唯一判分。 |
| 数量与范围 | all、some、every、enough | 整体、部分、逐个与满足需求分别呈现；enough 必须说清需要。 |
| 程度与比较 | very、more、than | 保持比较维度相同，标出参照对象；图片或样本不支持时不能硬判唯一答案。 |
| 原因与条件 | because、if、so、but | 原因、条件、结果、转折分别教学；先交代情境再连接句子。if 不表示条件已经发生。 |
| 冠词与辅助结构 | a、the、be、will | 用短句、已知与未知对象、状态或时间上下文说明；不要求图片单独解释。 |

以上是扩展的制作约束，尚未提供这些词的逐篇新脚本；在 850 词索引中仍据实标明覆盖状态。频率家族必须五词一起提供样例，再按 AGENTS.md 的小样审核流程扩展。

## 阅读流程和理解评估

1. 读前：显示目标词及短释义，允许查看复习词；主线目录显示建议阅读阶段。
2. 阅读：图文分开，默认英文，中文帮助跟随已有设置。保留目标词、音标和播放按钮的可见位置，限制媒体高度；翻页位置在长句和手机布局中保持稳定。点击下一页后按当前语音设置朗读；上一页和重复阅读的行为保持一致并可停止。
3. 读后：先回答意义题，再使用自己的物品、地点或理由完成一句表达。
4. 回访：从 Stories 列表重读故事、复看理解题与自己的句子；需要复习的目标词可加入现有复习队列。单词已认识与需要复习沿用原有机制。

每题先检查是否存在第二个合理答案。观点、喜好、个人原因与自由表达只给参考，不自动判定为某一句才正确。数量题有需求，方向题有朝向，位置题有参照，速度题有同一路径，原因题有事件联系。

## 插画制作说明

遵守 [AGENTS.md](../../AGENTS.md)。生成图不含英文或中文标签、对话气泡、箭头、时间轴、表格、水印；所有句子和教学记录使用语义 HTML。每页都是单一完整生活场景，不能用四宫格当作一页插画。

每本先固定人物、衣着、道具颜色、空间结构和叙述者，再制作关键动作页，确认后延展其他页。相同画面仅在完整表达足以区分词义时复用，例如 give 展示交接，because 用相关句子解释交接原因。新增大批素材前制作旧样与新样联系表，检查体积、光影、文字、视角与人物一致性。

记录、付款内容、时间与条件说明、必要的比较都放在图片外。record 和 receipt 的小纸片不能只是空白图加一个单词，必须配套可读的网页记录，且屏幕阅读器能获得同样信息。动态内容尊重减少动画设置。

## 词条校正与接入顺序

设计阶段发现 31 个主学词的释义或例句存在占位内容。现在已通过课程组装时的词条校正数据替换释义、中文、例句和英音音标，并把 across 改为关系类。下表保留原设计的教学建议；实际课程修订见 [词条校正数据](../../src/content/storyWordCorrections.json)，来源与检查见 [实施进度](execution-plan.md)。

| 词 | 建议释义 | 建议例句 |
| --- | --- | --- |
| drawer | a part of a table like a box that moves in and out | I open the drawer in the table. |
| while | at the same time as | I read while my friend writes. |
| example | one thing that shows what a kind of thing is like | My friend asks for an example of fruit. |
| selection | a thing you choose from a group | I choose the small cup. It is my selection. |
| cause | something that makes an event take place | The wind is the cause of this change. |
| purpose | the reason for doing something | I have a purpose for the bag. |
| loss | not having something that was your property | The loss of my key is a problem. |
| rule | a statement about what persons may or may not do | There is a rule: keep your voice low. |
| journey | the act of going from one place to another | My journey starts at home. |
| group | persons or things together | They are a group. |
| dirty | not clean | Now my hands are dirty. |
| dry | with no water on or in it | After some time, the cloth is dry. |
| art | pictures and other things that express ideas or feelings | My art shows how I feel about the garden. |
| distance | the space between 2 places | The distance from home to the shop is short. |
| growth | an increase in size | This change is the growth of the tree. |
| support | to help a person or thing | I support my friend by carrying some of the food. |
| opinion | what a person has in mind about something | In my opinion, the small cup is best for me. |
| river | a long, natural body of moving water on land | My friend and I walk near a river. |
| seed | a small part of a plant from which a new plant can come | I have a small seed. |
| across | from one side to the other | I walk across the bridge. |
| receipt | a paper that shows a payment | The shop gives me a receipt. |
| pull | to move a thing to you | I pull the drawer to me. |
| solid | not liquid or air | The stone keeps its form. It is solid. |
| observation | a fact learned by looking with care | One leaf is brown. That is my observation. |
| parcel | a thing covered in paper for carrying or sending | Now it is a parcel. |
| news | new knowledge about an event | My friend finished her work. This is the news in the letter. |
| between | in the space separating 2 things | Then I put it between the chair and the window. |
| slow | not quick | I carry it with slow steps. |
| if | on the condition that something happens | If there is rain, I will be at home. |
| thread | a thin line used for joining cloth | I put thread through the needle. |
| but | used to put different ideas together | The bag is small, but it is strong. |

主线按 1 至 12、13 至 20、21 至 36、37 至 52 周顺序完成，保留 give、under、because 及 open 补充篇的既有 ID。850 词索引中待补的词属于后续扩展池，按实际学习困难与语义家族选取，不按词表顺序机械生成。

## 交付文件和核验范围

- [逐篇内容](story-outlines.md)：53 篇的故事大纲、212 页英文与中文、画面要求、理解题、解释和表达任务。
- [结构化内容](curriculum.json)：完整教学脚本；构建脚本读取此文件，只有四页插画全部审核通过的篇目才进入应用阅读列表。
- [850 词索引](vocabulary-coverage.json)：每个核心词的课程周次、主学与复习关联、正文或题目出现情况、尚需扩展的状态。
- [核验报告](validation-report.json)：现有词汇政策校验、覆盖计数、需校正的源词条和读前支持候选。

本文保留整套内容设计与制作要求；53 篇的接入状态由交付状态逐项记录。词汇、插画连续性及桌面和手机检查的证据见实施进度；这些检查不替代真实学习者的阅读试教。
