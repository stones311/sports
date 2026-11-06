// 記憶體中暫存的揪團資料庫 (格式: { eventId: eventData })
const eventsDB = {};

/**
 * 建立新活動
 */
function createEvent(eventData) {
  eventsDB[eventData.id] = eventData;
  return eventData;
}

/**
 * 取得活動資料
 */
function getEvent(eventId) {
  return eventsDB[eventId] || null;
}

/**
 * 更新活動資料
 */
function updateEvent(eventId, newData) {
  if (eventsDB[eventId]) {
    eventsDB[eventId] = { ...eventsDB[eventId], ...newData };
    return eventsDB[eventId];
  }
  return null;
}

module.exports = {
  createEvent,
  getEvent,
  updateEvent,
};
