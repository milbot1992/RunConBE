const apiRouter = require("express").Router()
const groupsRouter = require('./groups-router')
const usersRouter = require('./users-router')
const runsRouter = require('./runs-router')

apiRouter.use("/groups", groupsRouter)
apiRouter.use("/users", usersRouter)
apiRouter.use("/runs", runsRouter)

module.exports = apiRouter