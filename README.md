# PostWallAd — 郵局牆面廣告版位出租平台

**虎之呼吸科技有限公司**  
服務區域：基隆市全區・新北市汐止區・新北市瑞芳區

---

## 網站網址

- 正式網址：https://postwallad.breathtiger.com/
- GitHub 儲存庫：https://github.com/breathtiger/postwallad

---

## 功能說明

| 頁面 | 路徑 | 功能 |
|------|------|------|
| 首頁 | `index.html` | 輪播圖、特色介紹、服務區域、三步驟 |
| 局所列表 | `locations.html` | 縣市/行政區篩選、搜尋、可用版位 badge |
| 版位詳細 | `spaces.html` | 版位卡片、即時報價、加入詢價、列印報價單 |

---

## 技術棧

- 純靜態前端：HTML / CSS / Vanilla JS
- UI：Bootstrap 5.3.3 + Font Awesome 6（cdnjs CDN）
- 後端：Google Apps Script（`Code.gs`）
- 資料庫：Google Sheets
- 跨域方案：JSONP

---

## Apps Script 部署說明

後端邏輯寫在 `Code.gs`（本地參考副本），需手動複製至 Google Apps Script 雲端編輯器。

### 步驟

1. 開啟 [script.google.com](https://script.google.com)，進入本專案的 Apps Script
2. 將 `Code.gs` 內容貼入（或更新對應函式）
3. 將 `Code.gs` 第 17 行的 `SPREADSHEET_ID` 佔位符換成實際 Spreadsheet ID
4. 點選「部署 → 管理部署項目 → 建立新版本」
5. 執行身分：**我（擁有者）**；存取對象：**所有人**

> ⚠️ Spreadsheet ID 為公司機密，請勿 commit 實際值。

### API 端點（doGet action 參數）

| action | 對應工作表 | 說明 |
|--------|-----------|------|
| `carousel` | `Carousel-titile` | 首頁輪播圖資料 |
| `locations` | `locations` | 郵局列表 |
| `spaces` | `ad_spaces` | 廣告版位 |
| `bookings` | `bookings` | 訂單資料 |
| `seo` | `SEO` | 各頁面 SEO meta 資料 |

所有請求須帶 `&callback=函式名稱`（JSONP 格式）。

---

## Google Sheets 工作表說明

### SEO 工作表（頁籤名稱：SEO）

由此工作表統一管理各頁面的 SEO 文字，更新後自動帶入網站，**無需修改程式碼**。

| 欄位 | 說明 |
|------|------|
| 頁面 | 對應 HTML 檔名，例如 `index.html` |
| 標題title | `<title>` 與 `og:title` |
| meta描述(og) | `<meta description>` 與 `og:description` |
| meta關鍵字(og) | `<meta keywords>` |
| og圖片網址 | `og:image` 與 `twitter:image` |

填寫範例：

| 頁面 | 標題title | meta描述(og) | meta關鍵字(og) | og圖片網址 |
|------|----------|-------------|--------------|---------|
| index.html | 郵局牆面廣告版位｜基隆、汐止、瑞芳 | 中華郵政基隆… | 郵局廣告,牆面廣告… | https://… |
| locations.html | 局所列表｜郵局牆面廣告版位 | 瀏覽基隆市… | 基隆廣告,… | https://… |
| spaces.html | 廣告版位｜郵局牆面廣告版位 | 瀏覽各郵局… | 版位出租,… | https://… |

---

## 安全性規範

以下資訊為公司機密，禁止 commit 至 Git：
- Google Apps Script 部署網址
- Google Sheets Spreadsheet ID
- 任何 API Key、token、secret

---

## 聯絡資訊

- 公司：虎之呼吸科技有限公司
- Email：service@breathtiger.com
- LINE：https://lin.ee/Rtr3Tlq4
- 官網：https://www.breathtiger.com
