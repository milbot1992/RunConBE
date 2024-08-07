const { fetchPostsForUserGroups, createPost } = require("../models/posts_model")

exports.GetPostsForUserGroups = (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchPostsForUserGroups(user_id).then((posts) => {
        res.status(200).send({posts});
    })
    .catch((err) => {
        next(err);
    });
};

exports.postPost = (req, res, next) => {
    const newPost = req.body;

    createPost(newPost)
        .then((post) => {
            res.status(201).send({ post });
        })
        .catch((err) => {
            next(err);
        });
};