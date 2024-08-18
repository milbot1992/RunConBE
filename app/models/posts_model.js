const {UsersRunningGroupsModel, PostsModel, PicturesModel} = require("../../db/seeds/seed")

exports.fetchPostsForUserGroups = async (user_id) => {
    try {
        // Find all user groups for the given user
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        // Extract group_ids
        const groupIds = userGroups.map(entry => entry.group_id);

        // Aggregation pipeline to fetch posts and join with pictures
        const postsWithPictures = await PostsModel.aggregate([
            // Match posts with group_ids from user groups
            {
                $match: {
                    group_id: { $in: groupIds }
                }

            },
            // Lookup to join with PicturesModel
            {
                $lookup: {
                    from: 'pictures', // The collection name for PicturesModel
                    localField: 'picture_id', // Field in PostsModel
                    foreignField: 'picture_id', // Field in PicturesModel
                    as: 'pictureDetails' // Alias for the joined data
                }
            },
            // Unwind the pictureDetails array
            {
                $unwind: {
                    path: '$pictureDetails',
                    preserveNullAndEmptyArrays: true // Allows posts without pictures
                }
            },
            // Add picture_url field to posts
            {
                $addFields: {
                    picture_url: '$pictureDetails.url'
                }
            },
            {
                $project: {
                    pictureDetails: 0,
                    picture_id: 0
                }
            }
        ]);

        if (postsWithPictures.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        return postsWithPictures;
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