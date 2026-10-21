const express = require("express");
const app = express();

// 讓 Render 自動決定要用哪個 Port，如果沒有就預設用 3000
const PORT = process.env.PORT || 3000;

//確認後端是否正常運作的文字
app.get("/", function (req, res) {
  res.send("Backend is running!");
});

// 之後你的 LINE Bot 接收訊息的路由會寫在這裡（例如 /webhook）
// app.post('/webhook', ...);

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});

// 加上這個路由讓 LINE Webhook 驗證通過
app.post("/webhook", function (req, res) {
  // 這裡可以先空著，或單純回覆 200 OK
  res.status(200).send("OK");
});
