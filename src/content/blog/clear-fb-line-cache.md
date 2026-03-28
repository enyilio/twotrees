---
title: 清除FaceBook、Line 網址縮圖與描述快取方法
date: "2022-02-27"
description: "Facebook和Line的網址縮圖與描述快取是伺服器快取。當用戶分享一個網址到Facebook或Line時，"
image: "/images/blog/facebookdebug.jpg"
categories: ["網站相關知識"]
---

Facebook和Line的網址縮圖與描述快取是伺服器快取。當用戶分享一個網址到Facebook或Line時，它們會從網址中提取縮圖和描述，並將其快取到自己的伺服器中，以便在用戶分享相同網址時快速提供相同的縮圖和描述。因此，如果網站主動更改網頁的縮圖或描述，需要清除Facebook和Line的伺服器快取才能使新的縮圖和描述生效。

#### 目錄

### 什麼是伺服器快取 (Server Cache)

在網站建置時，除了客戶端瀏覽器快取外，還有一種重要的快取方式，稱為伺服器快取。這種快取方式是在網站伺服器端進行快取，可以快速的提供網頁資料給使用者，同時也減輕了網站伺服器的負擔。

伺服器快取的機制通常是由網站伺服器上的快取程式負責，例如 Varnish Cache、Nginx FastCGI Cache 等。這些程式會自動監控網站伺服器的記憶體使用狀況，將較常使用的網頁內容先進行快取，當使用者在瀏覽網站時，伺服器就會直接提供快取資料，大大提升了網站的載入速度。

然而，FaceBook、LINE的網址縮圖與描述就是使用伺服器快取，因此清除方式會跟瀏覽器清除快取不同，以下為FaceBook、LINE網址清除快取方法。

### 清除 Facebook 網址縮圖與描述快取的步驟

![](/images/blog/Image-21.jpg)

- 進入 Facebook「分享連結除錯工具」(https://developers.facebook.com/tools/debug/)
- 貼上欲清除快取的網址
- 點選「偵錯」按鈕
- 在網頁瀏覽器中按下 Ctrl+F5 鍵或 Shift+F5 鍵，即可刷新該網址的快取

### 清除 Line網址縮圖與描述快取的步驟

![](/images/blog/line-clear-cache-1024x327.jpg)

- 進入Line清除快取網址( https://poker.line.naver.jp/)。
- 在網址列中輸入想要清除快取的網址。
- 選擇對應「語系」。
- 勾選「Clear Cache」。
- 按下「送出」按鈕。

###### 更多相關文章

- 如何清除瀏覽器快取，查看網站最真實的狀況