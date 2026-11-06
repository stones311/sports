require("dotenv").config(); // 務必加上這行來讀取 .env 檔案！
const express = require("express");
const line = require("@line/bot-sdk");
const { getEvent, updateEvent } = require("./database");
const { generateFlexMessage } = require("./linebot");

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Bot 設定金鑰（從環境變數讀取）
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(config);

// 解析 LINE 傳遞的 JSON 格式資料
app.use(express.json());

// 測試後端是否正常運作
app.get("/", function (req, res) {
  res.send("SportSync Backend is running!");
});

// 接收 LINE Webhook 事件（處理報名、取消報名、取消揪團）
app.post("/webhook", async function (req, res) {
  const events = req.body.events;

  if (events && events.length > 0) {
    for (const event of events) {
      if (event.type === "postback") {
        const params = new URLSearchParams(event.postback.data);
        const action = params.get("action");
        const eventId = params.get("eventId");
        const userId = event.source.userId;

        let eventData = getEvent(eventId);
        if (!eventData) continue;

        // 1. 我要報名邏輯
        if (action === "signup") {
          if (eventData.currentCount < eventData.maxCount) {
            eventData.currentCount += 1;
            // 若人數剛好達到上限 ➔ 轉為紅字「截止報名」
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

            // 如果原本是「截止報名」，釋出名額後變成藍字「加碼報名」
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
          await client.replyMessage(event.replyToken, [
            {
              type: "flex",
              altText: updatedFlex.altText,
              contents: updatedFlex.contents,
            },
          ]);
          console.log("成功將更新後的卡片回傳給 LINE！");
        } catch (error) {
          console.error(
            "回傳 LINE 失敗：",
            error.originalError?.response?.data || error,
          );
        }
      }
    }
  }

  res.status(200).send("OK");
});

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
