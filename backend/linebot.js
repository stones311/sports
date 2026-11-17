/**
 * 步驟一：選擇運動種類
 */
function generateSportChoiceMessage() {
  return {
    type: "text",
    text: "🏟️ 請問您這次想要舉辦哪一種運動？請點選下方選項：",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "🏸 羽球",
            text: "我要揪團 運動:羽球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🏀 籃球",
            text: "我要揪團 運動:籃球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🏐 排球",
            text: "我要揪團 運動:排球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "⚽ 足球",
            text: "我要揪團 運動:足球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🎾 網球",
            text: "我要揪團 運動:網球",
          },
        },
      ],
    },
  };
}

/**
 * 步驟二：使用 LINE 內建滾輪選擇日期
 */
function generateDatePickerMessage(sport) {
  const today = new Date().toISOString().split("T")[0];

  return {
    type: "text",
    text: `您選擇了【${sport}】👍\n請點擊下方按鈕，使用內建日曆滾輪選擇活動日期：`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "datetimepicker",
            label: "📅 選擇日期",
            data: `action=select_date&sport=${sport}`,
            mode: "date",
            initial: today,
            min: today,
          },
        },
      ],
    },
  };
}

/**
 * 步驟三：使用 LINE 內建滾輪選擇時間
 */
function generateTimePickerMessage(sport, dateStr) {
  return {
    type: "text",
    text: `已選擇日期【${dateStr}】👍\n請點擊下方按鈕，使用內建滾輪選擇開始時間：`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "datetimepicker",
            label: "⏰ 選擇時間",
            data: `action=select_time&sport=${sport}&date=${dateStr}`,
            mode: "time",
            initial: "14:00",
          },
        },
      ],
    },
  };
}

/**
 * 步驟四：要求傳送目前 GPS 位置
 */
function generateLocationRequestMessage(sport, dateStr, timeStr) {
  return {
    type: "text",
    text: `已選擇【${dateStr} ${timeStr}】👍\n最後請點擊下方按鈕傳送您的目前位置，我們將為您自動尋找附近的${sport}場地：`,
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
 * 步驟五：顯示附近的運動場清單
 */
function generateNearbyLocationsMessage(venues) {
  const items = venues.slice(0, 13).map((venue) => ({
    type: "action",
    action: {
      type: "message",
      label: venue.name.substring(0, 20),
      text: `選擇場地 ${venue.name}`,
    },
  }));

  return {
    type: "text",
    text: "🏟️ 幫您找到以下附近的運動場，請點選要舉辦的場地：",
    quickReply: { items },
  };
}

/**
 * 步驟六：選擇地區身分（北中南東）
 */
function generateHostChoiceMessage(locationName) {
  return {
    type: "text",
    text: `已選擇場地：${locationName} 👍\n\n請選擇您的地區身分：`,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "🏔️ 北 (北北基)",
            text: "設定地區 北 (北北基)",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "⛰️ 中 (竹苗中彰投)",
            text: "設定地區 中 (竹苗中彰投)",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🌊 南 (雲嘉南高屏)",
            text: "設定地區 南 (雲嘉南高屏)",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🌅 東 (宜花東)",
            text: "設定地區 東 (宜花東)",
          },
        },
      ],
    },
  };
}

/**
 * 步驟七：直接選擇總需求人數（1 ~ 13 人）
 */
function generateTotalCapacityMessage() {
  const items = [];
  for (let i = 1; i <= 13; i++) {
    items.push({
      type: "action",
      action: {
        type: "message",
        label: `${i} 人`,
        text: `總人數 ${i}`,
      },
    });
  }

  return {
    type: "text",
    text: "👥 【設定總需求人數】\n請直接選擇這次活動需要的總人數（1 ~ 13 人）：",
    quickReply: { items },
  };
}

/**
 * 步驟八：選擇目前已有幾人
 */
function generateCurrentCountMessage(totalCapacity) {
  const items = [];
  const maxLimit = Math.min(totalCapacity - 1, 12);

  for (let i = 0; i <= maxLimit; i++) {
    items.push({
      type: "action",
      action: {
        type: "message",
        label: `${i} 人`,
        text: `目前人數 ${i}`,
      },
    });
  }

  return {
    type: "text",
    text: `總需求 ${totalCapacity} 人（您已算在內），請問『目前除了您以外還有幾位』？請點選下方按鈕：`,
    quickReply: { items },
  };
}

/**
 * 產生最終揪團成功的卡片
 */
function generateCreateEventFlex(eventData = {}) {
  const emoji = eventData.emoji || "🏸";
  const sport = eventData.sport || "羽球";
  const dateStr = eventData.dateStr || "2026/03/20";
  const timeStr = eventData.timeStr || "14:00";
  const locationName = eventData.locationName || "綜合運動中心";
  const regionLabel = eventData.regionLabel || "北 (北北基)";

  const currentCount = Number.isInteger(eventData.currentCount)
    ? eventData.currentCount
    : 0;
  const totalCapacity =
    eventData.totalCapacity !== undefined && eventData.totalCapacity !== null
      ? parseInt(eventData.totalCapacity)
      : 4;

  const percentage = Math.min(
    Math.round((currentCount / totalCapacity) * 100),
    100,
  );

  let regionFull = "北部";
  if (regionLabel.includes("中")) regionFull = "中部";
  else if (regionLabel.includes("南")) regionFull = "南部";
  else if (regionLabel.includes("東")) regionFull = "東部";

  const hostName = `${regionFull}匿名球友`;
  const titleText = `${emoji}${regionFull}${sport}團`;

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName)}`;

  const communityLinks = {
    北: "https://line.me/ti/g2/zI1FwvzJeuXH45-YyMA17nwj9n_gWmnvP6GoPw?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
    中: "https://line.me/ti/g2/Pvueb4qCxuAj0yUsnhvBRNl3bvqlz-_1JTWo3g?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
    南: "https://line.me/ti/g2/88Gg41YYy5vM_Mav8jfnwZATf4pxoybQvwfVVQ?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
    東: "https://line.me/ti/g2/IS4zQ4X9NunLkSkB5ByiDVw_BPzt5UM69Exg8w?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
  };

  let regionKey = "北";
  if (regionLabel.includes("中")) regionKey = "中";
  if (regionLabel.includes("南")) regionKey = "南";
  if (regionLabel.includes("東")) regionKey = "東";

  const targetCommunityUrl = communityLinks[regionKey];

  return {
    type: "flex",
    altText: `【揪團成立】${titleText}`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "horizontal",
        paddingAll: "md",
        contents: [
          {
            type: "text",
            text: titleText,
            weight: "bold",
            color: "#ffffff",
            size: "lg",
            flex: 4,
          },
          {
            type: "text",
            text: "開放報名",
            color: "#1DB446",
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
        paddingAll: "md",
        spacing: "sm",
        contents: [
          {
            type: "text",
            text: `📅 日期：${dateStr} ${timeStr}`,
            color: "#ffffff",
            size: "md",
            weight: "bold",
            wrap: true,
          },
          {
            type: "text",
            text: `📍 地點：${locationName}`,
            color: "#ffffff",
            size: "sm",
            wrap: true,
          },
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "🗺️ 點擊開啟 Google Maps 查看",
              uri: mapUrl,
            },
            color: "#4A90E2",
            margin: "none",
          },
          {
            type: "text",
            text: `👤 揪團者：${hostName}`,
            color: "#aaaaaa",
            size: "sm",
          },
          {
            type: "separator",
            color: "#333333",
            margin: "md",
          },
          {
            type: "text",
            text: `目前報名 ${currentCount} / ${totalCapacity} 人`,
            color: "#1DB446",
            size: "md",
            weight: "bold",
            margin: "md",
          },
          {
            type: "box",
            layout: "vertical",
            margin: "xs",
            contents: [
              {
                type: "box",
                layout: "vertical",
                contents: [],
                backgroundColor: "#1DB446",
                height: "6px",
                width: `${percentage}%`,
              },
            ],
            backgroundColor: "#333333",
            height: "6px",
            cornerRadius: "3px",
          },
        ],
        backgroundColor: "#111111",
      },
      footer: {
        type: "box",
        layout: "vertical",
        paddingAll: "md",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            color: "#1DB446",
            height: "sm",
            action: {
              type: "uri",
              label: `💬 加入${regionFull}地區 LINE 社群`,
              uri: targetCommunityUrl,
            },
          },
          {
            type: "button",
            style: "primary",
            color: "#2E7d32",
            height: "sm",
            action: {
              type: "postback",
              label: "🎉 揪團已成功發布",
              data: `action=done&sport=${sport}`,
            },
          },
        ],
        backgroundColor: "#111111",
      },
    },
  };
}

/**
 * 【場地查詢】步驟一：選擇運動種類
 */
function generateSearchSportMessage() {
  return {
    type: "text",
    text: "🔍 【附近場地查詢】\n請問您想找哪一種運動的場地？",
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "message",
            label: "🏸 羽球",
            text: "找場地 運動:羽球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🏀 籃球",
            text: "找場地 運動:籃球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🏐 排球",
            text: "找場地 運動:排球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "⚽ 足球",
            text: "找場地 運動:足球",
          },
        },
        {
          type: "action",
          action: {
            type: "message",
            label: "🎾 網球",
            text: "找場地 運動:網球",
          },
        },
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
 * 【場地查詢】步驟三：顯示附近場地結果卡片
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
  generateTotalCapacityMessage,
  generateCurrentCountMessage,
  generateCreateEventFlex,
  generateSearchSportMessage,
  generateSearchLocationRequestMessage,
  generateNearbyVenuesFlex,
};
