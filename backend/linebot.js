/**
 * 產生揪團的 Flex Message 卡片
 * @param {Object} eventData 活動物件
 * @param {String} viewerUserId 正在檢視卡片的使用者 LINE UID
 */
function generateFlexMessage(eventData, viewerUserId) {
  // 1. 判斷檢視者身分：是否為揪團者 (Host)
  const isHost = viewerUserId === eventData.hostId;

  // 2. 決定底部按鈕行為：揪團者看「取消揪團」，報名者看「取消報名」
  let bottomButtonLabel = isHost ? "取消揪團" : "取消報名";
  let bottomAction = isHost ? "cancel_event" : "cancel_signup";

  // 如果活動已經取消，底部按鈕顯示已取消
  if (eventData.statusText === "取消活動") {
    bottomButtonLabel = "活動已取消";
    bottomAction = "none";
  }

  return {
    type: "flex",
    altText: `【揪團】${eventData.sportEmoji} ${eventData.title} 開放報名中！`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${eventData.sportEmoji} ${eventData.title}`,
            weight: "bold",
            color: "#ffffff",
            size: "md",
            flex: 4,
          },
          {
            type: "text",
            text: eventData.statusText, // 開放報名 / 截止報名 / 加碼報名 / 取消活動
            color: eventData.statusColor, // 依狀態變動的顏色（綠/紅/藍/灰）
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
            text: `日期：${eventData.date}`,
            color: "#ffffff",
            size: "sm",
          },
          {
            type: "text",
            text: `地點：${eventData.location}`,
            color: "#ffffff",
            size: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: `揪團者：${eventData.hostName}`,
            color: "#ffffff",
            size: "sm",
          },
          {
            type: "text",
            text: `目前報名 ${eventData.currentCount} / ${eventData.maxCount} 人`,
            color: "#00FF00",
            size: "md",
            weight: "bold",
            margin: "md",
          },
        ],
        backgroundColor: "#111111",
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            spacing: "sm",
            contents: [
              {
                type: "button",
                style: "primary",
                action: {
                  type: "postback",
                  label:
                    eventData.statusText === "截止報名"
                      ? "額滿排候補"
                      : "我要報名",
                  data: `action=signup&eventId=${eventData.id}`,
                },
              },
              {
                type: "button",
                style: "secondary",
                action: {
                  type: "postback",
                  label: "查看名單",
                  data: `action=view_list&eventId=${eventData.id}`,
                },
              },
            ],
          },
          {
            type: "button",
            style: "secondary",
            color: isHost ? "#FF5555" : "#AAAAAA", // 揪團者按鈕用紅色系，一般報名者用灰色系
            action: {
              type: "postback",
              label: bottomButtonLabel, // 動態顯示「取消揪團」或「取消報名」
              data: `action=${bottomAction}&eventId=${eventData.id}`,
            },
            margin: "md",
          },
        ],
        backgroundColor: "#111111",
      },
    },
  };
}

module.exports = {
  generateFlexMessage,
};
