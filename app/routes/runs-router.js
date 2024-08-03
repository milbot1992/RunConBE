const runsRouter = require("express").Router()
const {getRunsByGroup, getRunById, getRunsByUser, postRun, patchRun,deleteRun} = require("../controllers/runs_controller")

runsRouter.get("/group/:group_id", getRunsByGroup);
runsRouter.get("/run/:run_id", getRunById);
runsRouter.get("/user/:user_id", getRunsByUser);
runsRouter.post("/", postRun);
runsRouter.patch("/:run_id", patchRun);
runsRouter.delete("/:run_id", deleteRun);

module.exports = runsRouter