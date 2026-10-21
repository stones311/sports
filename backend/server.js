const express = require("express");
const app = express();

// 讓 Render 自動決定要用哪個 Port，如果沒有就預設用 3000
const PORT = process.env.PORT || 3000;

// 【重要】加上這一行來解析 LINE 傳過來的 JSON 格式資料
app.use(express.json());

// 確認後端是否正常運作的文字
app.get("/", function (req, res) {
  res.send("Backend is running!");
});

// 接收 LINE Webhook 驗證與事件的路由
app.post("/webhook", function (req, res) {
  // 回傳 200 OK 告訴 LINE 伺服器接收成功
  res.status(200).send("OK");
});

app.listen(PORT, function () {
  console.log(`Server is running on port ${PORT}`);
});
