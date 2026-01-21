# 新数据结构分析

## 概述

根据上传的真实投资数据，需要更新数据库schema以支持以下新字段和功能。

---

## 新增数据字段

### 基础信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `source_file` | String | 数据来源文件 | "000030 富奥股份 2025-02-15..." |
| `extraction_model` | String | 提取模型 | "glm-4" |
| `extraction_tokens` | Int | 提取token数 | 2898 |
| `confidence_score` | Float | 置信度分数 | 0.98 |
| `validated_at` | DateTime | 验证时间 | "2026-01-22T00:16:00" |

### 公告信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `announcement_title` | String | 公告标题 | "关于向紧固件德国公司境外放款的公告" |
| `announcement_stage` | Enum | 公告阶段 | "完成" / "进展" / "筹划" |

### 投资方信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `stock_code` | String | 股票代码 | "000030" |
| `company_name` | String | 公司名称 | "富奥汽车零部件股份有限公司" |
| `exchange` | String | 交易所 | "深交所" |
| `company_province` | String | 公司所在省份 | "吉林省" |
| `company_industry` | String | 公司所在行业 | "工业" |

### 投资信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `investment_type` | Enum | 投资类型 | "M&A" / "Greenfield" / "Other" |
| `investment_rationale` | Text | 投资理由 | "缓解紧固件德国公司流动资金需求压力..." |

### 目标公司信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `target_name` | String | 目标公司名称 | "ABC Umformtechnik GmbH & Co.KG" |
| `target_industry` | String | 目标行业 | "金属制品及工具制造" |
| `target_country_code` | String | 目标国家代码 | "DE" |
| `target_country_name` | String | 目标国家名称 | "德国" |
| `target_region` | String | 目标地区 | "北欧、西欧" |

### 交易信息字段

| 字段名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `deal_size_original` | Decimal | 原始交易金额 | 3500000.0 |
| `original_currency` | String | 原始货币 | "EUR" |
| `deal_size_usd` | Decimal | 美元交易金额 | 3666716.67 |
| `data_completeness` | Enum | 数据完整度 | "high" / "medium" / "low" |

---

## 数据库Schema设计

### 新表结构：investments_v2

```sql
CREATE TABLE investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- 数据来源和质量
  source_file VARCHAR(500),
  extraction_model VARCHAR(100),
  extraction_tokens INT,
  confidence_score DECIMAL(5, 4),
  validated_at TIMESTAMP,
  data_completeness ENUM('high', 'medium', 'low'),
  
  -- 公告信息
  announcement_date DATE NOT NULL,
  announcement_title VARCHAR(500),
  announcement_stage ENUM('筹划', '进展', '完成') DEFAULT '筹划',
  
  -- 投资方信息
  stock_code VARCHAR(50),
  company_name VARCHAR(255) NOT NULL,
  exchange VARCHAR(100),
  company_province VARCHAR(100),
  company_industry VARCHAR(100),
  
  -- 投资信息
  investment_type ENUM('M&A', 'Greenfield', 'Other') NOT NULL,
  investment_rationale TEXT,
  
  -- 目标公司信息
  target_name VARCHAR(255),
  target_industry VARCHAR(100),
  target_country_code VARCHAR(10),
  target_country_name VARCHAR(100) NOT NULL,
  target_region VARCHAR(100),
  
  -- 交易信息
  deal_size_original DECIMAL(20, 2),
  original_currency VARCHAR(10),
  deal_size_usd DECIMAL(20, 2) NOT NULL,
  
  -- 系统字段
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 索引
  INDEX idx_announcement_date (announcement_date),
  INDEX idx_investment_type (investment_type),
  INDEX idx_target_country (target_country_name),
  INDEX idx_company_name (company_name),
  INDEX idx_stock_code (stock_code)
);
```

---

## 关键变化

### 1. 投资类型扩展
- 原来：`M&A` / `Greenfield`
- 现在：`M&A` / `Greenfield` / `Other`

### 2. 投资阶段新增
- 新增 `announcement_stage` 字段：筹划 / 进展 / 完成

### 3. 数据质量指标
- `confidence_score`：提取置信度
- `data_completeness`：数据完整度
- `extraction_model`：使用的提取模型

### 4. 投资方信息完善
- 新增：`company_province`、`exchange`、`company_industry`

### 5. 目标地区信息
- 新增：`target_region` 字段

### 6. 货币转换
- 保留原始金额和货币：`deal_size_original`、`original_currency`
- 统一为美元：`deal_size_usd`

---

## 第一阶段功能范围

✅ **包含**：
- 首页统计和图表（基于新数据）
- 交易列表页（支持新字段筛选）
- 交易详情页（显示完整信息）
- 目的地分析页（按国家聚合）

❌ **不包含（第二阶段）**：
- M&A Insight 页面（留作第二阶段开发）

---

## 数据导入计划

1. 更新数据库schema
2. 创建数据导入脚本
3. 导入真实数据（约100+条记录）
4. 验证数据完整性和准确性
5. 更新前端以展示新数据

