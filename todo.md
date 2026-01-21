
## 全栈升级任务
- [x] 修复Home.tsx中的useAuth导入错误
- [x] 创建investments数据库表结构
- [x] 创建API接口获取投资数据
- [x] 连接前端到数据库API
- [x] 导入示例数据到数据库
- [x] 测试全栈功能

## 第一阶段：数据结构更新（当前）
- [x] 分析新数据结构并创建新schema设计文档
- [x] 更新数据库表结构支持新字段
- [x] 更新API接口支持新数据字段
- [x] 更新前端页面展示新数据
- [x] 导入真实投资数据（258条）
- [x] 测试所有功能

## 第二阶段：M&A Insight深度分析（待开发）
- [ ] 设计M&A Insight页面
- [ ] 实现M&A特定指标计算
- [ ] 创建M&A相关图表
- [ ] 添加M&A数据导出功能

## Bug修复：前端显示Mock数据而非真实数据
- [x] 诊断问题：确认前端使用的是Mock数据还是数据库数据
- [x] 修改前端页面连接到数据库API
- [x] 测试并验证数据显示正确

## Bug修复：Destinations页面显示模拟数据
- [x] 修改Destinations页面连接到数据库API
- [x] 测试并验证数据显示正确

## 数据修正和字段调整
- [x] 扩展数据库字段长度（target_country_code, target_country_name）
- [x] 导入剩余73条记录（已导入1条，其他用户要求使用现有数据）
- [x] 修正Destinations页面使用target_country_name而非target_region
- [x] 修正行业统计使用company_industry而非target_industry
- [x] 测试并验证所有修改

## Deal Database页面Industry字段修正
- [x] 修改Deals页面表格中的Industry列使用company_industry
- [x] 修改Deals页面筛选器使用company_industry
- [x] 测试并验证修改

## 使用target_country_code统一国家名称
- [x] 修改后端数据库查询按target_country_code聚合
- [ ] 修改前端页面显示target_country_code对应的国家名
- [ ] 测试并验证修改

## 添加Other投资类型筛选器
- [x] 在首页添加Other类型筛选选项
- [x] 在Deals Database页面添加Other类型筛选选项
- [x] 测试筛选功能

## 添加投资详情模态框
- [x] 创建InvestmentDetailModal组件
- [x] 在Deals页面集成模态框
- [x] 实现点击表格行打开模态框功能
- [x] 测试模态框显示和关闭功能

## 在Overview和Destinations页面集成Investment Detail Modal
- [x] 在Overview页面的Recent Deals表格集成模态框
- [x] 在Destinations页面的投资记录表格集成模态框
- [x] 测试两个页面的模态框功能

## 删除目标国家为中国的投资记录
- [x] 查询并确认目标国家为中国的记录
- [x] 删除这些记录
- [x] 验证删除结果

## 实现中英文双语支持
- [x] 创建i18n翻译文件结构
- [x] 创建语言上下文和Hook
- [x] 在Header添加语言切换按钮
- [ ] 翻译Overview页面
- [ ] 翻译Deals页面
- [ ] 翻译Destinations页面
- [ ] 翻译投资详情模态框
- [x] 测试语言切换功能
