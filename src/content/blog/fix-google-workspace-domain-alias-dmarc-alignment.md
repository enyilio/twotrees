---
title: 解決 Google Workspace 網域別名 DMARC 對齊失效之實務指南
date: "2026-04-04"
description: "當企業使用 Google Workspace 網域別名（Domain Alias）發信時，常會遇到 DMARC 驗證失敗。本文說明根本原因與透過獨立 DKIM 選擇器徹底解決對齊失效的實務步驟。"
categories: ["網站相關知識"]
---

## 1. 問題背景與現象分析

在 Google Workspace 環境中，當企業使用**網域別名 (Domain Alias)**（如 twoflower.tw）進行發信時，常會遇到 DMARC 驗證失敗的情況。根據 DMARC 聚合報告（Aggregate Report）顯示：

- **SPF / DKIM 驗證狀態**：技術指標顯示為 pass。
- **DMARC 判定結果**：顯示為 fail。
- **根本原因**：標籤對齊 (Alignment) 失敗。郵件雖然通過技術驗證，但驗證所採用的網域為「主網域」twotrees.tw，與郵件標頭（Header From）顯示的 twoflower.tw 不符。

## 2. 關鍵技術概念：為何預設設定會失敗？

DMARC 的核心在於**「一致性」**。Google Workspace 預設會將所有網域的 DKIM 選擇器（Selector）命名為 `google`。若未針對別名網域進行獨立設定，系統可能產生以下衝突：

**選擇器衝突**：若 twotrees.tw 與 twoflower.tw 在 DNS 中皆使用 `google._domainkey` 作為路徑，系統可能無法正確導引至專屬的公鑰。

**降級簽署**：當系統無法在別名網域下找到有效的 DKIM 授權時，會自動調用主網域（twotrees.tw）的金鑰進行簽署。雖然簽名有效，但因網域不一致，DMARC 會判定為對齊失效。

下圖清楚呈現失敗狀態與修復狀態的差異：

![網域別名的 DMARC 對齊方案](/images/blog/dmarc-domain-alias-alignment.png)

## 3. 標準解決方案：實施獨立選擇器 (Selector Isolation)

### 步驟一：產生別名網域專屬 DKIM

1. 進入 **Google 管理控制台 > Apps > Google Workspace > Gmail > 驗證電子郵件 (DKIM)**。
2. 在「所選網域」選單切換至 `twoflower.tw`。
3. 點擊「產生新紀錄」，並將**「選取 DKIM 選擇器前綴詞」**由預設的 `google` 修改為具備辨識度的字串（例如：`twoflower`）。

### 步驟二：配置 DNS 紀錄

於 twoflower.tw 的 DNS 管理介面新增以下 TXT 紀錄：

| 欄位 | 值 |
|------|-----|
| 主機名稱 (Hostname) | `twoflower._domainkey` |
| 內容 (Value) | 貼上 Google 產生的金鑰字串（含 `v=DKIM1; k=rsa; p=...`） |

### 步驟三：啟動驗證程序

回到 Google 控制台點擊「開始驗證」。驗證成功後，系統將強制使用 `d=twoflower.tw` 網域進行簽署，確保與 Header From 達成完美對齊。

## 4. SPF 與 DMARC 政策配置建議

為了確保郵件傳遞率，請同步確認以下設定：

**SPF 配置**：別名網域 twoflower.tw 的 DNS 必須包含：

```
v=spf1 include:_spf.google.com ~all
```

若同時使用 **SendGrid** 寄送郵件（如行銷信、系統通知），必須將 SendGrid 的發信伺服器一併加入 SPF，否則透過 SendGrid 發出的郵件仍會觸發 SPF 驗證失敗：

```
v=spf1 include:_spf.google.com include:sendgrid.net ~all
```

> **注意**：每個網域只能有一筆 SPF TXT 紀錄。請勿新增第二筆，應將所有 `include:` 合併在同一行。

**DMARC 政策轉移**：

| 階段 | 政策 | 說明 |
|------|------|------|
| 初始階段 | `p=none` | 持續觀察報告，確保所有發信來源（含第三方工具如 SendGrid）皆已正確對齊 |
| 加嚴階段 | `p=quarantine` 或 `p=reject` | 確認 Google 來源的 DKIM 顯示為 pass 且對齊後，再提升政策等級 |

## 5. 結論

解決別名網域發信問題的關鍵在於**「身份獨立化」**。透過自定義 DKIM 選擇器，可以強制 Google Workspace 為別名網域提供專屬的數位簽章，從根本上解決 DMARC 對齊失效的問題。
