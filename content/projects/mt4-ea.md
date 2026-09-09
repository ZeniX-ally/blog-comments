---
slug: mt4-ea
name: MT4 EA
year: 2026
tech:
  - MQL4
  - MT4
featured: true
description: 外汇自动化交易 EA，中长线策略，全自动运行不人工干预。
description_en: "A fully-automated forex trading EA with medium/long-term strategies, no manual intervention."
---

## 背景

一套运行在 MetaTrader 4 上的外汇自动化交易 EA（Expert Advisor）。定位是 **中长线策略**：不追日内噪音，按规则开平仓，尽量减少人工盯盘。

## 我做了什么

- **全自动运行**：信号判断、下单、止损止盈由程序执行，日常不人工干预
- **风控优先**：仓位与风险参数可配置，避免情绪化加仓
- **可回测**：在 MT4 Strategy Tester 中验证逻辑与参数稳定性

## 技术栈

使用 **MQL4** 编写，挂载于 **MT4** 终端。策略与风控参数通过输入变量暴露，便于按品种与周期微调。

## 结果/现状

交易有风险，本项目仅作个人研究与工程练习，不构成任何投资建议。实盘前务必充分回测与模拟。持续按回测结果迭代参数与风控。
