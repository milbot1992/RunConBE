exports.fetchPostsForUserGroups = async (user_id) => {
    try {
        // Find all user groups
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }

        // Extract group_ids
        const groupIds = userGroups.map(entry => entry.group_id);

        // Find all posts with the extracted group_ids
        const posts = await PostsModel.find({ group_id: { $in: groupIds } }).exec();

        if (posts.length === 0) {
            return Promise.reject({ status: 404, message: 'No posts found for the given user.' });
        }
        console.log('>>>', posts);
        return posts;
    } catch (err) {
        console.error('Error fetching posts for user:', err);
        throw err;
    }
};