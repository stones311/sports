require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { messagingApi } = require("@line/bot-sdk");
const {
  generateSportChoiceMessage,
  generateDatePickerMessage,
  generateTimePickerMessage,
  generateLocationRequestMessage,
  generateNearbyLocationsMessage,
  generateHostChoiceMessage,
  generateTensDigitMessage,
  generateUnitsDigitMessage,
  generateConfirmTotalMessage,
  generateCurrentCountMessage,
  generateCreateEventFlex,
} = require("./linebot");

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

const userSessions = {};

app.get("/", function (req, res) {
  res.send("SportSync Backend is running!");
});

app.get("/webhook", function (req, res) {
  res.status(200).send("Webhook Verified Successfully!");
});

app.post("/webhook", async function (req, res) {
  const events = req.body.events;

  if (events && events.length > 0) {
    for (const event of events) {
      const userId = event.source.userId;

      if (event.type === "message" && event.message.type === "text") {
        const userText = event.message.text;

        if (userText === "我要揪團") {
          userSessions[userId] = { step: "select_sport" };
          const msg = generateSportChoiceMessage();
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [msg],
          });
        } else if (userText.startsWith("我要揪團 運動:")) {
          const sport = userText.split("運動:")[1];
          userSessions[userId] = { step: "select_date", sport };
          const msg = generateDatePickerMessage(sport);
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [msg],
          });
        } else if (userText.startsWith("選擇場地 ")) {
          const locationName = userText.replace("選擇場地 ", "");
          const session = userSessions[userId];
          if (session) {
            session.locationName = locationName;
            session.step = "select_host_region";

            const msg = generateHostChoiceMessage(locationName);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        }
        // 接收地區身分，進入「選擇十位數」
        else if (userText.startsWith("設定地區 ")) {
          const session = userSessions[userId];
          if (session && session.step === "select_host_region") {
            session.regionLabel = userText.replace("設定地區 ", "");
            session.step = "select_tens_digit";

            const msg = generateTensDigitMessage();
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        }
        // 接收十位數，進入「選擇個位數」
        else if (userText.startsWith("十位數 ")) {
          const session = userSessions[userId];
          if (session && session.step === "select_tens_digit") {
            session.tempTens = parseInt(userText.replace("十位數 ", ""));
            session.step = "select_units_digit";

            const msg = generateUnitsDigitMessage(session.tempTens);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        }
        // 接收個位數，組合並讓使用者確認
        else if (userText.startsWith("個位數 ")) {
          const session = userSessions[userId];
          if (session && session.step === "select_units_digit") {
            const units = parseInt(userText.replace("個位數 ", ""));
            session.totalCapacity = session.tempTens * 10 + units;

            if (session.totalCapacity <= 0) session.totalCapacity = 4; // 防呆預設

            session.step = "confirm_total";

            const msg = generateConfirmTotalMessage(session.totalCapacity);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        }
        // 確認總人數結果
        else if (userText === "確認總人數 正確") {
          const session = userSessions[userId];
          if (session && session.step === "confirm_total") {
            session.step = "select_current_count";

            const msg = generateCurrentCountMessage(session.totalCapacity);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        } else if (userText === "重新選擇總人數") {
          const session = userSessions[userId];
          if (session) {
            session.step = "select_tens_digit";
            const msg = generateTensDigitMessage();
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          }
        }
        // 接收目前已有幾位（加入除錯 Log）
        else if (userText.startsWith("目前人數 ")) {
          const session = userSessions[userId];
          if (session && session.step === "select_current_count") {
            console.log("🐞 收到目前人數原始文字：", JSON.stringify(userText));

            const rawCount = userText.replace("目前人數 ", "").trim();
            session.currentCount = rawCount === "" ? 0 : parseInt(rawCount, 10);

            console.log(
              "🐞 解析後的 currentCount 數值：",
              session.currentCount,
            );

            const emojiMap = {
              羽球: "🏸",
              籃球: "🏀",
              排球: "🏐",
              足球: "⚽",
              網球: "🎾",
            };
            const emoji = emojiMap[session.sport] || "🏸";

            const flexCard = generateCreateEventFlex({
              emoji,
              sport: session.sport,
              dateStr: session.dateStr,
              timeStr: session.timeStr,
              locationName: session.locationName,
              regionLabel: session.regionLabel,
              totalCapacity: session.totalCapacity,
              currentCount: session.currentCount,
            });

            delete userSessions[userId];

            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [flexCard],
            });
          }
        }
      } else if (event.type === "postback") {
        const data = event.postback.data;

        if (data.startsWith("action=select_date")) {
          const params = new URLSearchParams(data);
          const sport = params.get("sport");
          const selectedDate = event.postback.params.date;
          const formattedDate = selectedDate.replace(/-/g, "/");

          userSessions[userId] = {
            step: "select_time",
            sport,
            dateStr: formattedDate,
          };

          const timeMsg = generateTimePickerMessage(sport, formattedDate);
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [timeMsg],
          });
        } else if (data.startsWith("action=select_time")) {
          const params = new URLSearchParams(data);
          const sport = params.get("sport");
          const dateStr = params.get("date");
          const selectedTime = event.postback.params.time;

          const session = userSessions[userId] || {};
          session.sport = sport;
          session.dateStr = dateStr;
          session.timeStr = selectedTime;
          session.step = "get_location";
          userSessions[userId] = session;

          const locMsg = generateLocationRequestMessage(
            sport,
            dateStr,
            selectedTime,
          );
          await client.replyMessage({
            replyToken: event.replyToken,
            messages: [locMsg],
          });
        }
      } else if (
        event.type === "message" &&
        event.message.type === "location"
      ) {
        const session = userSessions[userId];
        if (session && session.step === "get_location") {
          const lat = event.message.latitude;
          const lng = event.message.longitude;
          const sport = session.sport;

          try {
            const apiKey = process.env.GOOGLE_MAPS_API_KEY;
            const keyword = `${sport}場`;
            const mapsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

            const response = await axios.get(mapsUrl);
            const results = response.data.results;

            let venues = [];
            if (results && results.length > 0) {
              venues = results.map((item) => ({ name: item.name }));
            } else {
              const fallbackUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&keyword=${encodeURIComponent("運動中心")}&key=${apiKey}`;
              const fallbackRes = await axios.get(fallbackUrl);
              venues = fallbackRes.data.results.map((item) => ({
                name: item.name,
              }));
            }

            if (venues.length === 0) {
              venues = [{ name: "附近運動中心" }];
            }

            const msg = generateNearbyLocationsMessage(venues);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [msg],
            });
          } catch (error) {
            console.error("Google Maps API 查詢失敗：", error.message);
            await client.replyMessage({
              replyToken: event.replyToken,
              messages: [
                {
                  type: "text",
                  text: "抱歉，尋找附近場地時發生錯誤，請直接手動輸入場地名稱：",
                },
              ],
            });
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
