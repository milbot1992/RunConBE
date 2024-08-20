const {UsersRunningGroupsModel, PostsModel} = require("../../db/seeds/seed")

exports.fetchPostsForUserGroups = async (user_id) => {
    try {
        // Find all user groups for the given user
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        // Extract group_ids
        const groupIds = userGroups.map(entry => entry.group_id);
        console.log('group_ids:', groupIds);

        // Aggregation pipeline to fetch posts and join with user pictures
        const posts = await PostsModel.aggregate([
            // Match posts with group_ids from user groups
            {
                $match: {
                    group_id: { $in: groupIds }
                }
            },
            // Lookup to join with UserModel to get user picture_url
            {
                $lookup: {
                    from: 'users', // The collection name for UserModel
                    localField: 'user_id', // Field in PostsModel
                    foreignField: 'user_id', // Field in UserModel
                    as: 'userDetails' // Alias for the joined data
                }
            },
            // Unwind the userDetails array
            {
                $unwind: {
                    path: '$userDetails',
                    preserveNullAndEmptyArrays: true // Allows posts without matching users
                }
            },
            // Add user_url field to posts
            {
                $addFields: {
                    user_url: '$userDetails.picture_url'
                }
            },
            // Remove userDetails from the final output
            {
                $project: {
                    userDetails: 0
                }
            }
        ]).exec();

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