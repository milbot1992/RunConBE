const runsRouter = require("express").Router()
const {getRunsByGroup, getRunById, getRunsByUser, getUpcomingRunForGroup, postRun, postUserAttendingRun, patchRun, deleteRun, deleteUserAttendingRun} = require("../controllers/runs_controller")

runsRouter.get("/group/:group_id", getRunsByGroup);
runsRouter.get("/run/:run_id", getRunById);
runsRouter.get("/user/:user_id", getRunsByUser);
runsRouter.get("/upcoming/:group_id", getUpcomingRunForGroup);
runsRouter.post("/", postRun);
runsRouter.post("/users", postUserAttendingRun);
runsRouter.patch("/:run_id", patchRun);
runsRouter.delete("/:run_id", deleteRun);
runsRouter.delete("/:run_id/users/:user_id", deleteUserAttendingRun);

module.exports = runsRouter