const mongoose = require('mongoose')
const devData = require("../data/development-data/index")
const { GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel, ChatsModel, ChatParticipantsModel, MessagesModel, PostsModel, PicturesModel, seedData } = require('./seed');

mongoose.connection.on('open', () => {
  seedData(devData, GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel, ChatsModel, ChatParticipantsModel, MessagesModel, PostsModel, PicturesModel)
    .then(() => {
      mongoose.connection.close()
    })

})