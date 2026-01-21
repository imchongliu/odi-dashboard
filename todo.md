
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
- [x] 翻译Overview页面主体内容
- [x] 翻译TypeStatCards组件
- [x] 翻译StatCard组件
- [x] 翻译MonthlyTrendChart组件
- [x] 翻译CountryBarChart组件
- [x] 翻译IndustryBarChart组件
- [x] 翻译TopCountriesTable组件
- [x] 翻译RecentDealsTable组件
- [ ] 翻译Deals页面
- [ ] 翻译Destinations页面
- [ ] 翻译投资详情模态框
- [x] 测试语言切换功能

## 修复Overview页面翻译问题
- [x] 添加“日常消费”和“通讯服务”的英文翻译
- [x] 在Recent Deals表格中翻译Country列的国家名称
- [x] 确认Investor列不需要翻译（公司名称保持原文）

## 修复剩余翻译问题
- [x] 修正status中“进展”的英文翻译为“In Progress”
- [x] 确认Investor和Target列标题已正确翻译
- [x] 修复StatusBadge组件支持中文状态值
- [x] 修复RecentDealsTable使用正确的announcement_stage字段

## 修复Status Badge颜色区分问题
- [x] 更新StatusBadge组件支持翻译（筹划→Planning, 进展→In Progress, 完成→Completed）
- [x] 为不同状态设置独特颜色（Planning=黄色, In Progress=蓝色, Completed=绿色）
- [x] 在Deals页面测试Status Badge显示
- [x] 验证中英文切换时Status Badge正确翻译和显示颜色

## 修改首页布局
- [x] 将"Top 10 Countries by Value"改名为"Deal Size Top 10"
- [x] 更新中英文翻译文件
- [x] 删除首页的"Recent Deals"表格部分
- [x] 测试修改后的首页显示

## 修改Deal Size Top 10显示单笔交易
- [x] 创建TopDealsTable组件显示按交易金额排序的前10笔交易
- [x] 在首页替换TopCountriesTable为TopDealsTable
- [x] 添加"View More Deals"链接跳转到Deals页面
- [x] 测试新组件显示和链接功能

## 修改Deal Size Top 10标题为Top Deals
- [x] 在翻译文件中添加topDeals键
- [x] 更新TopDealsTable组件使用新的翻译键
- [x] 测试中英文标题显示
