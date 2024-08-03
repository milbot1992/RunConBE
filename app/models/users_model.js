const {UserModel,UsersRunningGroupsModel, UsersAttendingRunsModel} = require("../../db/seeds/seed")

exports.fetchUserById = (user_id) => {

    return UserModel.find({user_id})
        .then((user) => {

            if (user.length === 0) {
                return Promise.reject({ status: 404, message: 'User Does Not Exist!' });
            }

            return user[0];
        });
};

exports.fetchUsersByGroupId = async (group_id) => {
    try {
        // Aggregate the data by joining UsersRunningGroupsModel and UserModel on user_id
        const users = await UsersRunningGroupsModel.aggregate([
            {
                $match: { group_id : Number(group_id) }
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'user_id',
                    foreignField: 'user_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $replaceRoot: { newRoot: '$userDetails' }
            }
        ]);

        if (users.length === 0) {
            return Promise.reject({ status: 404, message: 'No users found for this group!' });
        }

        return users;
    } catch (err) {
        console.error('Error fetching users by group:', err);
        throw err;
    }
};

exports.fetchUsersByRunId = async (run_id) => {
    const users2 = await UsersAttendingRunsModel.find({})
    try {
        // Aggregate the data by joining UsersAttendingRunsModel and UserModel on user_id
        const users = await UsersAttendingRunsModel.aggregate([
            {
                $match: { run_id : Number(run_id) }
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'user_id',
                    foreignField: 'user_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $replaceRoot: { newRoot: '$userDetails' }
            }
        ]);
        if (users.length === 0) {
            return Promise.reject({ status: 404, message: 'No users found for this run!' });
        }

        return users;
    } catch (err) {
        console.error('Error fetching users by run:', err);
        throw err;
    }
};

exports.createUser = async (newUser) => {
    try {
        // Fetch the latest user_id
        const maxUser = await UserModel.findOne({}, { user_id: 1 }, { sort: { user_id: -1 } });
        const newUserId = maxUser ? maxUser.user_id + 1 : 1;
        
        // Create the new user with the new user_id
        const user = new UserModel({
            ...newUser,  
            user_id: newUserId 
        });

        // Save the user
        const savedUser = await user.save();
        return savedUser;
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
};

exports.updateUserById = async (user_id, updates) => {
    try {
        // Find the original user by user_id and convert to plain object
        const originalUser = await UserModel.findOne({ user_id: Number(user_id) }).lean();

        if (!originalUser) {
            throw { status: 404, message: 'User not found!' };
        }

        // Create a copy of the original user object for comparison
        const originalUserObject = { ...originalUser }; 

        // Apply the updates
        const updatedUser = await UserModel.findOneAndUpdate(
            { user_id: Number(user_id) },
            { $set: updates },
            { new: true, lean: true } // Use lean to get a plain object
        );

        // Create a copy of the updated user object for comparison
        const updatedUserObject = { ...updatedUser };

        // Remove `_id` and other non-updatable fields from the comparison
        delete originalUserObject._id;
        delete originalUserObject.__v;
        delete updatedUserObject._id;
        delete updatedUserObject.__v;

        // Compare the original and updated user objects
        const isModified = Object.keys(updates).some((key) => {
            return originalUserObject[key] !== updatedUserObject[key];
        });

        if (!isModified) {
            return { status: 400};
        }

        return updatedUser;
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
};

exports.removeUserById = async (user_id) => {
    try {
        // Find and delete the user by user_id
        const deletedUser = await UserModel.findOneAndDelete({ user_id: Number(user_id) });

        if (!deletedUser) {
            throw { status: 404, message: 'User not found!' };
        }

        return deletedUser;
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
};