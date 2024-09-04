const { ChatsModel, ChatParticipantsModel, UserModel, GroupModel } = require("../../db/seeds/seed")

exports.fetchChatsForUser = async (user_id) => {
    try {
        // Step 1: Fetch chats for the specified user
        const chats = await ChatParticipantsModel.aggregate([
            {
                $match: { user_id: Number(user_id) }
            },
            {
                $lookup: {
                    from: ChatsModel.collection.name,
                    localField: 'chat_id',
                    foreignField: 'chat_id',
                    as: 'chatDetails'
                }
            },
            {
                $unwind: '$chatDetails'
            },
            {
                $replaceRoot: { newRoot: '$chatDetails' }
            }
        ]);

        if (chats.length === 0) {
            return Promise.reject({ status: 404, message: 'No chats found for this user!' });
        }

        // Step 2: Fetch users for each chat, excluding the specified user
        const chat_ids = chats.map(chat => chat.chat_id);
        const chatParticipants = await ChatParticipantsModel.aggregate([
            {
                $match: {
                    chat_id: { $in: chat_ids },
                    user_id: { $ne: Number(user_id) }  // Exclude the requesting user
                }
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
                $project: {
                    _id: 0,
                    chat_id: 1,
                    username: '$userDetails.username',
                    first_name: '$userDetails.first_name',
                    picture_url: '$userDetails.picture_url' // Include picture_url from UsersModel
                }
            },
            {
                $group: {
                    _id: '$chat_id',
                    users: {
                        $push: {
                            username: '$username',
                            first_name: '$first_name',
                            picture_url: '$picture_url'  // Add picture_url to each user
                        }
                    }
                }
            }
        ]);

        // Organise users by chat_id
        const chatUsersMap = chatParticipants.reduce((map, chat) => {
            map[chat._id] = chat.users;
            return map;
        }, {});

        // Step 3: Join with GroupModel if is_group is true
        const chatsWithUsers = await Promise.all(chats.map(async chat => {
            if (chat.is_group) {
                const group = await GroupModel.findOne({ group_id: chat.group_id }, { picture_url: 1 }).exec();
                return {
                    ...chat,
                    users: chatUsersMap[chat.chat_id] || [],
                    group_picture_url: group ? group.picture_url : null // Add group picture_url if available
                };
            }
            return {
                ...chat,
                users: chatUsersMap[chat.chat_id] || []
            };
        }));

        return {
            chats: chatsWithUsers
        };
    } catch (err) {
        console.error('Error fetching chats for user:', err);
        throw err;
    }
};

