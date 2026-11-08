/**
 * 產生「發起揪團」的設定/預覽 Flex Message 卡片
 * @param {Object} eventData 活動設定物件
 */
function generateCreateEventFlex(eventData = {}) {
  // 預設值（當尚未選擇時的顯示文字）
  const emoji = eventData.emoji || "🏀";
  const city = eventData.city || "台北市";
  const sport = eventData.sport || "籃球";
  const dateStr = eventData.dateStr || "2026/03/15";
  const weekday = eventData.weekday || "日";
  const startTime = eventData.startTime || "14:00";
  const endTime = eventData.endTime || "16:00";
  const locationName = eventData.locationName || "新北市新莊國民運動中心";
  const mapUrl = eventData.mapUrl || "https://maps.google.com";
  const hostName = eventData.hostName || "小幫手";

  return {
    type: "flex",
    altText: `【建立揪團】${emoji}${city}${sport}團`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${emoji}${city}${sport}團`,
            weight: "bold",
            color: "#ffffff",
            size: "md",
            flex: 4,
          },
          {
            type: "text",
            text: "建立中",
            color: "#FFA500",
            align: "end",
            weight: "bold",
            size: "sm",
            flex: 2,
          },
        ],
        backgroundColor: "#111111",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: `日期：${dateStr} (${weekday}) ${startTime} ~ ${endTime}`,
            color: "#ffffff",
            size: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: `地點：${locationName}`,
            color: "#ffffff",
            size: "sm",
            margin: "sm",
            wrap: true,
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "🗺️ 點擊開啟 Google Maps 地圖選擇",
              uri: mapUrl,
            },
            color: "#4A90E2",
            margin: "xs",
          },
          {
            type: "text",
            text: `揪團者：${hostName}`,
            color: "#ffffff",
            size: "sm",
            margin: "sm",
          },
        ],
        backgroundColor: "#111111",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#1DB446", // LINE 綠色
            action: {
              type: "postback",
              label: "確認送出並建立揪團",
              data: "action=confirm_create",
            },
          },
        ],
        backgroundColor: "#111111",
      },
    },
  };
}

module.exports = {
  generateCreateEventFlex,
};
