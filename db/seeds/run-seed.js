const mongoose = require('mongoose')
const devData = require("../data/development-data/index")
const { GroupModel, UserModel, seedData } = require('./seed');

mongoose.connection.on('open', () => {
  seedData(devData, GroupModel, UserModel)
    .then(() => {
      mongoose.connection.close()
    })

})