---
title: 修復Elementor Widget menu cart 無法正常顯示內容
date: "2023-06-20"
description: "此次在協助處理WooCommrece網站Bug問題，是關於網站頁首(Header)的menu cart功能，當"
image: "/images/blog/2023062001website-design.jpg"
categories: ["WordPress相關文章"]
---

此次在協助處理WooCommrece網站Bug問題，是關於網站頁首(Header)的menu cart功能，當點選menu cart後，出現的滑動選單內無法正常顯示內容。由於該功能是使用Elementor的小工具，於是上網查了一些資料才發現原來這個問題已經存在很久了，從2019年開始就有網友反映此問題，直至今問題仍然存在不了解這樣常見的問題，Elementor團隊為何選擇忽視，但既然遇到了，就自己處理吧。								

#### 目錄

### Elementor Menu Cart Widget 存在的問題

當點選頁首(Header)上方的Menu Cart，滑動選單內無法正常顯示內容。

![](/images/blog/2023062002website-design.jpg)

![](/images/blog/2023062003website-design.jpg)

### JS文件沒有正常載入

造成[Elementor Menu Cart](https://elementor.com/help/menu-cart-widget-pro/) Widget無法正常顯示選單內容，問題來自以下JS文件沒有正常載入

（/wp-content/plugins/woocommerce/assets/js/frontend/cart-fragments.min.js）

解決方法：後台管理區點選**外觀/佈景主題檔案編輯器/functions.php**
複製貼上以下程式碼:

function elementor_menucart_js_css()
{
wp_enqueue_script( 'wc-cart-fragments' );
}
add_action('wp_enqueue_scripts', 'elementor_menucart_js_css', 999);

經測試，當重新引入 **cart-fragments.min.js 後，**點選menu cart按鈕，確實已正常顯示內容。								

![](/images/blog/2023062004website-design.jpg)

如果你的網站正在使用elementor的menu cart小工具，且有遇到類似的問題，可以嘗試看看。

參考來源:https://github.com/elementor/elementor/issues/9304