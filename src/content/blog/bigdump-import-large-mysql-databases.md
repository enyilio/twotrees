---
title: 利用「BigDump」協助匯入龐大MySQL資料庫
date: "2012-09-18"
description: "MYSQL資料庫匯入的方式有很多種，一般較常使用phpMyAdmin管理介面來匯入與匯出。正常情況匯出檔案不會"
image: "https://twotrees.tw/wp-content/uploads/2012/09/bigdump.jpg"
categories: ["網頁相關技術"]
---

MYSQL資料庫匯入的方式有很多種，一般較常使用phpMyAdmin管理介面來匯入與匯出。正常情況匯出檔案不會有太多問題，而匯入時就會發生伺服器對檔案大小有所限制，導致sql無法正常匯入。

解決方式有很多種，在這推薦一種簡單的解決方式，使用「BigDump」工具，可以協助將sql檔直接匯入MySQL資料庫，此種方式不需修改「php.ini」組態檔中的「upload_max_filesize」或「max_input_time」等設定檔。

#### 目錄

### 下載「BigDump」

先至「BigDump」官方網站下載:[http://www.ozerov.de/bigdump/](http://www.ozerov.de/bigdump/)

![](https://twotrees.tw/wp-content/uploads/2023/02/phpmysql02.jpg)

### 設定 BigDump.php

將下載來的檔案解壓縮後，打開「bigdump.php」，進行資料庫帳號、使用者帳號及密碼等設定。按Ctrl+F搜尋「$db_server」，再將實際資料庫資料填入：

$db_server = '主機名稱';（一般為localhost）
$db_name = '資料庫名稱';
$db_username = '使用者帳號';
>$db_password = '使用者密碼'

範例:

![](https://twotrees.tw/wp-content/uploads/2023/02/phpmysql03.jpg)

接著再搜尋「$filename」，針對下列資料進行設定：

$filename = '檔案名稱.sql';
$ajax = true;
$linespersession = 3000; (設定每次還原幾筆資料)
$delaypersession = 5000; (每次間隔休息時間，設定5000為休息5秒鐘。)

範例:

![](https://twotrees.tw/wp-content/uploads/2023/02/phpmysql04.jpg)

再來搜尋「$db_connection_charset」設定資料庫語系，依照資料庫語系進行設定，一般填入「utf8」即可。

$db_connection_charset = 'utf8';

### 使用「BigDump」進行資料匯入

將「bigdump.php」與「檔案名稱.sql」放入同一個資料夾，並上傳至伺服器。

最後打開瀏覽器輸入bigdump.php 所在網址，例如: [http://domain.tw/dump/bigdump.php](http://domain.tw/dump/bigdump.php)

![](https://twotrees.tw/wp-content/uploads/2023/02/phpmysql06.jpg)

當藍bar全滿後，出現**「Congratulations: End of file reached, assuming OK」**的訊息後，表示資料庫匯入完成。

![](https://twotrees.tw/wp-content/uploads/2023/02/phpmysql07.jpg)

### 實作影片參考