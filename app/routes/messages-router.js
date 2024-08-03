const messagesRouter = require("express").Router();
const { GetMessagesForChat } = require("../controllers/messages_controller");

messagesRouter.get("/:chat_id", GetMessagesForChat);
//messagesRouter.post("/", PostMessage);
//messagesRouter.patch("/:message_id", PatchMessage);
//messagesRouter.delete("/:message_id", DeleteMessage);

module.exports = messagesRouter;