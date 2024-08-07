const picturesRouter = require("express").Router();
const { getPicturesForGroup } = require("../controllers/pictures_controller");

picturesRouter.get("/:group_id", getPicturesForGroup);


module.exports = picturesRouter;
