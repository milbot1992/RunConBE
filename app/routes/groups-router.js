const groupsRouter = require("express").Router();
const { getAllGroups, getGroupById, getGroupsByUser, postGroup, patchGroup, deleteGroup } = require("../controllers/groups_controller");

groupsRouter.get("/", getAllGroups);
groupsRouter.get("/group/:group_id", getGroupById);
groupsRouter.get("/user/:user_id", getGroupsByUser);
groupsRouter.post("/", postGroup);
groupsRouter.patch("/:group_id", patchGroup);
groupsRouter.delete("/:group_id", deleteGroup);

module.exports = groupsRouter;
