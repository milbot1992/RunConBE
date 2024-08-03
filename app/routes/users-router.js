const usersRouter = require("express").Router()
const {getUserById, getUsersByGroup, getUsersByRun, postUser, patchUser, deleteUser} = require("../controllers/users_controller")

usersRouter.get("/user/:user_id", getUserById);
usersRouter.get("/group/:group_id", getUsersByGroup);
usersRouter.get("/run/:run_id", getUsersByRun);
usersRouter.post("/", postUser);
usersRouter.patch("/:user_id", patchUser);
usersRouter.delete("/:user_id", deleteUser);

module.exports = usersRouter