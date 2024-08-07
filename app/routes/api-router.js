const apiRouter = require("express").Router()
const groupsRouter = require('./groups-router')
const usersRouter = require('./users-router')
const runsRouter = require('./runs-router')
const chatsRouter = require('./chats-router')
const messagesRouter = require('./messages-router')
const postsRouter = require('./posts-router')
const picturesRouter = require('./pictures-router')

apiRouter.use("/groups", groupsRouter)
apiRouter.use("/users", usersRouter)
apiRouter.use("/runs", runsRouter)
apiRouter.use("/chats", chatsRouter)
apiRouter.use("/messages", messagesRouter)
apiRouter.use("/posts", postsRouter)
apiRouter.use("/pictures", picturesRouter)

module.exports = apiRouter