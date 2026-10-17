/* 測試用 */
const express = require("express");
const app = express();
app.get("/", function (req, res) {
  res.send("Backend is running!");
});
app.listen(3000, function () {
  console.log("���A���w���\�Ұʦbport 3000");
});
