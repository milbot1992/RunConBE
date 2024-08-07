const postsRouter = require("express").Router();
const { GetPostsForUserGroups, postPost } = require("../controllers/posts_controller");

postsRouter.get("/groups/:user_id", GetPostsForUserGroups);
postsRouter.post("/", postPost);


module.exports = postsRouter;