const {UsersRunningGroupsModel, PostsModel} = require("../../db/seeds/seed")

exports.fetchPostsForUserGroups = async (user_id) => {
    console.log('user_id:', user_id);
    try {
        // Find all user groups
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        // Extract group_ids
        const groupIds = userGroups.map(entry => entry.group_id);
        console.log('group_ids:', groupIds);
        // Find all posts with the extracted group_ids
        const posts = await PostsModel.find({ group_id: { $in: groupIds } }).exec();

        if (posts.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        return posts;
    } catch (err) {
        console.error('Error fetching posts for user groups:', err);
        throw err;
    }
};



exports.createPost = async (newPost) => {
    try {
        // Fetch the latest post_id
        const maxPost = await PostsModel.findOne({}, { post_id: 1 }, { sort: { post_id: -1 } });
        const newPostId = maxPost ? maxPost.post_id + 1 : 1;
        
        // Create the new post with the new post_id
        const post = new PostsModel({
            ...newPost,  
            post_id: newPostId 
        });

        // Save the user
        const savedPost = await post.save();
        return savedPost;
    } catch (err) {
        console.error('Error creating post:', err);
        throw err;
    }
};