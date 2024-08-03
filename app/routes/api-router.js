const apiRouter = require("express").Router()
const groupsRouter = require('./groups-router')
const usersRouter = require('./users-router')
const runsRouter = require('./runs-router')
const chatsRouter = require('./chats-router')
const messagesRouter = require('./messages-router')

apiRouter.use("/groups", groupsRouter)
apiRouter.use("/users", usersRouter)
apiRouter.use("/runs", runsRouter)
apiRouter.use("/chats", chatsRouter)
apiRouter.use("/messages", messagesRouter)

module.exports = apiRouter