const messagesRouter = require("express").Router();
const { GetMessagesForChat, getLatestMessageFromChat, PostAMessage, patchAMessage, deleteAMessage } = require("../controllers/messages_controller");

messagesRouter.get("/:chat_id", GetMessagesForChat);
messagesRouter.get("/latest/:chat_id", getLatestMessageFromChat);
messagesRouter.post("/", PostAMessage);
messagesRouter.patch("/:message_id", patchAMessage);
messagesRouter.delete("/:message_id", deleteAMessage);

module.exports = messagesRouter;