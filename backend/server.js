require("dotenv").config();
const express = require("express");
const { messagingApi } = require("@line/bot-sdk");
const { generateCreateEventFlex } = require("./linebot"); // 假設你有一個專門產生建立卡片的函式

const app = express();
const PORT = process.env.PORT || 3000;

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: config.channelAccessToken,
});

app.use(express.json());

app.get("/", function (req, res) {
  res.send("SportSync Backend is running!");
});

app.get("/webhook", function (req, res) {
  res.status(200).send("Webhook Verified Successfully!");
});

// 接收 LINE Webhook 事件
app.post("/webhook", async function (req, res) {
  const events = req.body.events;

  if (events && events.length > 0) {
    for (const event of events) {
      const userId = event.source.userId;

      // 當使用者點擊圖文選單的「我要揪團」
      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        if (userText === "我要揪團") {
          // 產生一張「純揪團建立/設定」的 Flex 訊息（沒有報名按鈕、沒有人數）
          const createFlexMessage = generateCreateEventFlex();

          try {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [createFlexMessage],
            });
            console.log("成功發送揪團建立卡片！");
          } catch (error) {
            console.error("LINE 發送失敗：", error.message);
            if (error.body)
              console.error("詳細原因：", JSON.stringify(error.body));
          }
        }
      }

      // 如果未來有揪團設定完成的 postback（例如點擊「確認發起」按鈕）
      if (event.type === "postback") {
        const params = new URLSearchParams(event.postback.data);
        const action = params.get("action");

        if (action === "confirm_create") {
          // 這裡可以處理把揪團資料正式寫入資料庫的邏輯
          try {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [{ type: "text", text: "🎉 揪團建立成功！" }],
            });
          } catch (error) {
            console.error("回覆失敗：", error.message);
          }
        }
      }
    }
  }

  res.status(200).send("OK");
});

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
