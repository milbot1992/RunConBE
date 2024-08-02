const {UserModel,UsersRunningGroupsModel, UsersAttendingRunsModel} = require("../../db/seeds/seed")
const mongoose = require('mongoose');

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