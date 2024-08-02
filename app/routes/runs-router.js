const runsRouter = require("express").Router()
const {getRunsByGroup, getRunById, getRunsByUser} = require("../controllers/runs_controller")

runsRouter.get("/group/:group_id", getRunsByGroup);
runsRouter.get("/run/:run_id", getRunById);
runsRouter.get("/user/:user_id", getRunsByUser);

module.exports = runsRouter