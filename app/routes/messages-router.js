const messagesRouter = require("express").Router();
const { GetMessagesForChat, getLatestMessageFromChat, PostAMessage, patchAMessage, deleteAMessage, patchMessagesInChatAsRead } = require("../controllers/messages_controller");

messagesRouter.get("/:chat_id", GetMessagesForChat);
messagesRouter.get("/latest/:chat_id", getLatestMessageFromChat);
messagesRouter.post("/", PostAMessage);
messagesRouter.patch("/:message_id", patchAMessage);
messagesRouter.delete("/:message_id", deleteAMessage);
messagesRouter.patch('/chat/:chat_id/read', patchMessagesInChatAsRead);

module.exports = messagesRouter;