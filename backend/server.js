require("dotenv").config();
const express = require("express");
const { messagingApi } = require("@line/bot-sdk");
const { generateCreateEventFlex } = require("./linebot");

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
          // 產生符合新排版要求的建立揪團卡片
          const createFlexMessage = generateCreateEventFlex({
            emoji: "🏀",
            city: "台北市",
            sport: "籃球",
            dateStr: "2026/03/15",
            weekday: "日",
            startTime: "14:00",
            endTime: "16:00",
            locationName: "新北市新莊國民運動中心",
            mapUrl: "https://maps.google.com/?q=新北市新莊國民運動中心",
            hostName: "揪團主辦人",
          });

          try {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [createFlexMessage],
            });
            console.log("成功發送新版揪團建立卡片！");
          } catch (error) {
            console.error("LINE 發送失敗：", error.message);
            if (error.body)
              console.error("詳細原因：", JSON.stringify(error.body));
          }
        }
      }

      // 當使用者點擊「確認送出並建立揪團」
      if (event.type === "postback") {
        const params = new URLSearchParams(event.postback.data);
        const action = params.get("action");

        if (action === "confirm_create") {
          try {
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [{ type: "text", text: "🎉 您的揪團已成功建立！" }],
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
