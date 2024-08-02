const groupsRouter = require("express").Router();
const { getAllGroups, getGroupById, getGroupsByUser, postGroup } = require("../controllers/groups_controller");

groupsRouter.get("/", getAllGroups);
groupsRouter.get("/group/:group_id", getGroupById);
groupsRouter.get("/user/:user_id", getGroupsByUser);
groupsRouter.post("/", postGroup);

module.exports = groupsRouter;
