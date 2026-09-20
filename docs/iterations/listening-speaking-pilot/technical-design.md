# 技术设计与开发任务

状态：建议方案，未实施。以 2026-09-20 检查的 React 19、TypeScript、idb、Vitest、Playwright 项目为基线。

## 当前实现与改动边界

| 文件 | 当前情况 | 建议改动 |
|---|---|---|
| src/domain/progress.ts | 固定 stepOrder；completed 决定下一天解锁 | 保留旧流程，新增按日解析器与独立训练进度 |
| src/components/TodayPage.tsx | 编排现有步骤与完成记录 | 按 flowVersion 选择 legacy / skills-pilot-v1 |
| src/storage/indexedDbProgressRepository.ts | IndexedDB 版本 7 | 增量到 8；增加训练及音频 store，不清空旧库 |
| src/storage/progressRepository.ts | 既有进度仓储接口 | 以组合接口增加训练仓储，避免无关 mock 全面扩张 |
| src/speech/speechService.ts | 浏览器 speechSynthesis | 接入音频互斥控制，保留地区和语速设置 |
| src/domain/masteryQuestions.ts | 文字选择/填空/排序 | 不将新口语自评混入旧 mastery 正确率 |
| src/content/validateContent.ts | 校验既有课程对象 | 新增训练内容校验入口和前置内容检查 |

版本 8 是本次基线上的建议；实施前重新确认分支实际 DB_VERSION，避免与并行变更冲突。

## 内容模型

建议新增 src/content/skillLessons.ts 与 src/domain/skillTraining.ts。使用已有 dayId/wordId/patternId，不复制整套课程。

```ts
type Skill = 'listening' | 'speaking' | 'reading' | 'writing';
type PilotStage = 'review' | 'prepare' | 'listen' | 'speak' | 'use';
type Hint = 'keywords' | 'reference' | 'transcript' | 'chinese';
type SkillTask =
  | { kind: 'listening'; id: string; script: string[]; options: string[]; answer: string; feedback: string }
  | { kind: 'speaking'; id: string; mode: 'repeat' | 'free'; model: string; keywords: string[]; goal: string }
  | { kind: 'dialogue'; id: string; turns: DialogueTurn[]; closingScript?: string }
  | { kind: 'reading'; id: string; text: string; questions: ReadingQuestion[] }
  | { kind: 'writing'; id: string; prompt: string; references: string[]; checklist: string[] };
```

DialogueTurn 明确 id、partnerScript（可空）、learnerGoal、keywords、referenceAnswers；空台词表示用户主动发问，不合成对方理解。ReadingQuestion 包含 id/options/answer/feedback。正式接口由内容样例驱动，不加入未使用的通用题型。

SkillLesson 包含 dayId、revision、flowVersion、stageTasks、prerequisiteWordIds、prerequisitePatternIds、microLessons、declaredExceptions。任务 ID 稳定，修改答案或台词提升 revision，旧证据保留对应 revision。

## 证据与完成状态

新增 skillDayProgress：key=dayId，flowVersion/revision、currentStage、completedTaskIds、skippedTaskIds、coreCompletedAt、fullyCompletedAt、updatedAt。阶段进度不挤入旧 StepId。

新增 skillAttempts：key=attemptId(UUID)，索引 byDayId/byTaskId。包含 dayId/taskId/turnId/revision、skill、mode、startedAt/submittedAt、answer/firstCorrect（仅客观题）、selfMark、recordingId（可空）、playbackStartedAt、hintEvents、replayCount、usedSlowRate、retryOf、afterFeedback。hintEvents 记录提示类型与时间，必须在展开时持久化；显式新尝试生成新 ID。

新增 recordings：key=recordingId，索引 byTaskTurn/byCreatedAt。Blob、mimeType、bytes、durationMs、createdAt、taskId/turnId、attemptId。Blob 与元数据同条存储，不用 base64/localStorage。

口语任务完成 = 必要各轮首次满足“录音保存 + 回放开始 + 自评”的证据存在。后续删除 Blob 不撤销已持久化证据；从未成功保存者不能通过。客观题错答可完成练习，同时生成需复习证据。

每日核心完成 = 所有非口语必要任务完成。全完成 = 核心完成 + 所有必要口语任务完成。跳过口语只能满足阶段导航，不能伪造全完成。

课程解锁共同解析：legacy completed 或 pilot coreCompletedAt 允许下一天。Course/Today/Me、能力卡、当前日选择和 streak 均调用同一解析器，不让各页面自行解释状态。继续课程序列与历史补练分离。

旧 completed 原样保留、旧 in_progress 固定 legacy。新开始的前两周走 pilot。旧用户进入试点作为独立练习记录，不撤销既有完成或重锁后续课程。

StudyActivity 沿用每天唯一记录：pilot 首次 core complete 时合并 dayId，补练只更新技能记录，不重复增加课程完成天数。首版不展示未经计时实现验证的“学习分钟数”。

## 仓储事务

建议接口：get/saveSkillDayProgress、list/getSkillAttempts、saveAttempt、commitRecording、deleteRecording、clearRecordings、getRecordingUsage、completeSkillTask。

- commitRecording：同一 readwrite 事务读取总容量、检查 100 MiB 上限、写 Blob/attempt 引用、淘汰同轮第 4 条的最旧 Blob、更新被淘汰引用。事务失败整体回滚；替换空间按净增量计算，但仍处理实际浏览器 QuotaExceededError。
- completeSkillTask：同一事务写自评/证据与日进度，避免页面先通过但存储未成功。稳定 attemptId 防双击重复。
- 删除：同一事务删除音频并清空关联 recordingId；保留 savedRecordingAt 等历史完成证据。全部清除前 UI 确认。
- DB upgrade：仅新建 store/index；不把旧自评分数转成听说分数。处理 blocked/versionchange，提示关闭旧标签或刷新，不删库恢复。

## 音频生命周期

新增 AudioSessionCoordinator、recordingService 和 React hook；协调示范 TTS、录音、录音回放三种所有者。单一 owner token 标识当前会话，旧 onend/onerror 不可更新新会话。

状态：idle → requesting → recording → stopping → saving → ready；各阶段可进入 error。权限请求等待时允许取消/跳过；延迟授权返回后若 token 已失效，立即 stop 全部 tracks，不能自动开始录音。

录音开始前停止 TTS/回放。录制中禁用其他播放；新播放取消旧播放。录音停止后等待最终 dataavailable 和 stop 再保存，不提前宣布成功。60 秒或 5 MiB 达限自动停止，展示原因并允许回放；零字节不保存为完成。

页面隐藏/设备中断：停止采集并尝试保存已有片段为 draft，要求回听确认后才允许提交。站内导航拦截未保存草稿；窗口刷新/系统关闭不保证异步保存。清理所有 MediaStreamTrack、事件监听和 Object URL；异常路径也执行清理。

getUserMedia 需安全上下文及权限；发布使用 GitHub Pages HTTPS，本地使用 localhost。参见 [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)。

按 MediaRecorder.isTypeSupported 探测 audio/webm;codecs=opus、audio/mp4，再尝试平台默认格式；保存实际 mimeType，不固定扩展名。能力探测通过仍可能运行失败，需处理异常并真机回放。参见 [MDN isTypeSupported](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static)。

TTS 沿用用户地区/语速设置，不保证相同声音或离线可用。无 TTS 时提供文字辅助，但听力任务记为无法完成，可明确跳过并显示 listening pending；基础完成/下一日放行规则扩展为已提交或因能力缺失明确跳过，全部完成仍要求补听。监听失败不能当作听懂。

## UI 与复习

新建小组件 ListeningTask、SpeakingTask、DialoguePractice、RecordingLibrary，复用当前视觉样式。主按钮仅表达当前动作；录制用麦克风/停止图标，回放用播放/暂停，配可访问名称与状态。保存中立即反馈，不允许重复 Continue。

待补属于未完成任务，强化属于完成但需再练，分开展示。默认次日安排错听、错读和自评 Try again；同 task/skill 去重，单次最多 3 项，剩余保留下一次。下一次通过后 3 天、7 天安排变式，失败返回次日；口语通过只称自评改善，不自动升级 mastery。日期沿用本地日规则，注入时钟测试。

统计来自本地证据，无新增遥测上传。首次客观正确率、重听次数、提示层级、口语自评、待补数量分开呈现。

## 开发拆分

| 任务 | 依赖 | 交付与验证 | 负责角色 |
|---|---|---|---|
| T01 内容合同与首日 fixture | 文档 review | 类型、样例数据、词表/前置校验 | 内容 + 前端 |
| T02 录音兼容性验证 | 无代码依赖 | 真机探测/录制/保存/回放结果，确定格式 | 前端 + QA |
| T03 仓储与进度迁移 | T01 | 原子保存、删除、配额、旧数据 fixture 测试 | 前端 |
| T04 音频协调与录音控件 | T02,T03 | 并发取消、生命周期、权限/失败测试 | 前端 |
| T05 听力与提示记录 | T01,T03 | 首次答题、提示泄露、重试测试 | 前端 |
| T06 Today 纵向首日 | T03,T04,T05 | 五阶段、待补、补练、跨页统一状态 E2E | 前端 + QA |
| T07 角色/读写/复习 | T06 | 三脚本、改写记录、到期/去重验证 | 内容 + 前端 |
| T08 填充两周并审核 | T01,T06 | 14 天台词/题目/反馈及教学先修审核 | 内容 |
| T09 真机、试用、发布评审 | T07,T08 | acceptance.md 证据与试用结果 | QA + 产品 |

每项先写风险对应测试，再实现；不以 mock 录音测试代替真机。T06 是下一个集中 review 节点。T09 前不大规模扩展 52 周。
