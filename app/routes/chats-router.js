const chatsRouter = require("express").Router();
const { getChatsForUser } = require("../controllers/chats_controller");

chatsRouter.get("/:user_id", getChatsForUser);

module.exports = chatsRouter;