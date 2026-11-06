require("dotenv").config(); // 務必加上這行來讀取 .env 檔案！
const express = require("express");
const { messagingApi } = require("@line/bot-sdk");
const { getEvent, updateEvent } = require("./database");
const { generateFlexMessage } = require("./linebot");

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot 設定金鑰（從環境變數讀取）
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

// 解析 LINE 傳遞的 JSON 格式資料
app.use(express.json());

// 測試後端是否正常運作
app.get("/", function (req, res) {
  res.send("SportSync Backend is running!");
});

// 接收 LINE Webhook 事件（處理文字訊息與按鈕點擊）
app.post("/webhook", async function (req, res) {
  const events = req.body.events;

  if (events && events.length > 0) {
    for (const event of events) {
      const userId = event.source.userId;

      // ----------------------------------------------------
      // 情境 A：當使用者點擊圖文選單的「文字」（我要揪團）
      // ----------------------------------------------------
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        if (userText === "我要揪團") {
          // 因為點文字無法帶參數，這裡我們先抓一個預設或測試用的 eventId（例如 "123" 或 1）
          // 你可以根據你資料庫（database.js）裡的實際活動 ID 來填寫
          const eventId = "我要揪團"; // 這裡可以改成你想要的活動 ID
          let eventData = getEvent(eventId);

          if (!eventData) {
            console.log(`找不到活動 ID: ${eventId} 的資料`);
            continue;
          }

          // 動態產生第一版的 Flex Message 物件
          const flexMessage = generateFlexMessage(eventData, userId);

          try {
            // 回覆 Flex 卡片給使用者
            await client.replyMessagePost({
              replyToken: event.replyToken,
              messages: [flexMessage],
            });
            console.log("圖文選單觸發：Flex 訊息發送成功！");
          } catch (error) {
            console.error("LINE 發送失敗：", error.message);
            if (error.body)
              console.error("詳細原因：", JSON.stringify(error.body));
          }
        }
      }

      // ----------------------------------------------------
      // 情境 B：當使用者點擊 Flex 卡片上的「按鈕」（報名、取消報名等 Postback）
      // ----------------------------------------------------
      if (event.type === "postback") {
        const params = new URLSearchParams(event.postback.data);
        const action = params.get("action");
        const eventId = params.get("eventId");

        let eventData = getEvent(eventId);
        if (!eventData) continue;

        // 1. 我要報名邏輯
        if (action === "signup") {
          if (eventData.currentCount < eventData.maxCount) {
            eventData.currentCount += 1;
            if (eventData.currentCount === eventData.maxCount) {
              eventData.statusText = "截止報名";
              eventData.statusColor = "#FF0000"; // 紅字
            }
          }
        }
        // 2. 取消報名邏輯
        else if (action === "cancel_signup") {
          if (eventData.currentCount > 0) {
            eventData.currentCount -= 1;
            if (eventData.statusText === "截止報名") {
              eventData.statusText = "加碼報名";
              eventData.statusColor = "#0088FF"; // 藍字
            }
          }
        }
        // 3. 揪團者取消揪團邏輯
        else if (action === "cancel_event") {
          if (userId === eventData.hostId) {
            eventData.statusText = "取消活動";
            eventData.statusColor = "#808080"; // 灰字
          }
        }

        // 寫入資料庫更新
        updateEvent(eventId, eventData);

        // 產生更新後的 Flex Message 卡片
        const updatedFlex = generateFlexMessage(eventData, userId);

        // 透過 LINE Messaging API 將更新後的卡片即時回覆給使用者
        try {
          await client.replyMessagePost({
            replyToken: event.replyToken,
            messages: [updatedFlex],
          });
          console.log("成功將更新後的卡片回傳給 LINE！");
        } catch (error) {
          console.error("回傳更新後的卡片失敗：", error.message);
          if (error.body)
            console.error("詳細原因：", JSON.stringify(error.body));
        }
      }
    }
  }

  res.status(200).send("OK");
});

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
