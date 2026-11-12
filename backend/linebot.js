/**
 * 【場地查詢】步驟一：選擇運動種類
 */
function generateSearchSportMessage() {
  return {
    type: "text",
    text: "🔍 【附近場地查詢】\n請問您想找哪一種運動的場地？",
    quickReply: {
      items: [
        { type: "action", action: { type: "message", label: "🏸 羽球", text: "找場地 運動:羽球" } },
        { type: "action", action: { type: "message", label: "🏀 籃球", text: "找場地 運動:籃球" } },
        { type: "action", action: { type: "message", label: "🏐 排球", text: "找場地 運動:排球" } },
        { type: "action", action: { type: "message", label: "⚽ 足球", text: "找場地 運動:足球" } },
        { type: "action", action: { type: "message", label: "🎾 網球", text: "找場地 運動:網球" } },
      ],
    },
  };
}

/**
 * 【場地查詢】步驟二：要求傳送目前位置
 */
function generateSearchLocationRequestMessage(sport) {
  return {
    type: "text",
    text: `已選擇查詢【${sport}】場地 👍\n請點擊下方按鈕傳送您的目前位置：`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "location",
            label: "📍 傳送我的目前位置",
          },
        },
      ],
    },
  };
}

/**
 * 【場地查詢】步驟三：顯示附近場地結果卡片（場地名稱 -> 場地地址 -> 開啟 Google Maps 按鈕）
 */
function generateNearbyVenuesFlex(venues, sport) {
  const bubbles = venues.slice(0, 10).map((venue) => {
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.name)}&query_place_id=${venue.place_id}`;

    return {
      type: "bubble",
      size: "kilo",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        paddingAll: "lg",
        contents: [
          {
            type: "text",
            text: venue.name,
            weight: "bold",
            size: "md",
            color: "#0d47a1",
            wrap: true,
          },
          {
            type: "text",
            text: `📍 ${venue.address}`,
            size: "xs",
            color: "#666666",
            wrap: true,
            margin: "sm",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "md",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#007aff",
            height: "sm",
            action: {
              type: "uri",
              label: "🗺️ 開啟 Google Maps",
              uri: mapUrl,
            },
          },
        ],
      },
    };
  });

  return {
    type: "flex",
    altText: `為您找到附近的${sport}場地`,
    contents: {
      type: "carousel",
      contents: bubbles,
    },
  };
}

module.exports = {
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
  generateSearchSportMessage,
  generateSearchLocationRequestMessage,
  generateNearbyVenuesFlex,
};
