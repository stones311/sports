/**
 * 產生「發起揪團」的設定/預覽 Flex Message 卡片（純發起用，無報名、無人數）
 */
function generateFlexMessage() {
  return {
    type: "flex",
    altText: "【建立揪團】請設定您的運動揪團資訊",
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: "📢 建立新揪團",
            weight: "bold",
            color: "#ffffff",
            size: "md",
            flex: 4,
          },
          {
            type: "text",
            text: "設定中",
            color: "#FFA500", // 橘色代表草稿/設定中
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
            text: "運動類型：🏀 籃球 / 🏸 羽球 ...",
            color: "#aaaaaa",
            size: "sm",
          },
          {
            type: "text",
            text: "活動時間：請選擇日期與時間",
            color: "#aaaaaa",
            size: "sm",
            margin: "sm",
          },
          {
            type: "text",
            text: "活動地點：請選擇運動場地",
            color: "#aaaaaa",
            size: "sm",
            margin: "sm",
            wrap: true,
          },
          {
            type: "text",
            text: "人數上限：預設 8 人",
            color: "#aaaaaa",
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
              data: "action=confirm_create_event",
            },
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
