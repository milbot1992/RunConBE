const { ChatsModel, ChatParticipantsModel, UserModel, GroupModel } = require("../../db/seeds/seed")

exports.fetchChatsForUser = async (user_id) => {
    try {
        // Fetch chats and relevant details in one aggregation pipeline
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
            },
            {
                $lookup: {
                    from: GroupModel.collection.name,
                    let: { group_id: '$group_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$group_id', '$$group_id'] }
                            }
                        },
                        {
                            $project: { group_name: 1, picture_url: 1 }
                        }
                    ],
                    as: 'groupDetails'
                }
            },
            {
                $addFields: {
                    group_name: { $arrayElemAt: ['$groupDetails.group_name', 0] },
                    group_picture_url: { $arrayElemAt: ['$groupDetails.picture_url', 0] }
                }
            },
            {
                $lookup: {
                    from: ChatParticipantsModel.collection.name,
                    localField: 'chat_id',
                    foreignField: 'chat_id',
                    as: 'participants'
                }
            },
            {
                $unwind: '$participants'
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'participants.user_id',
                    foreignField: 'user_id',
                    as: 'userDetails'
                }
            },
            {
                $unwind: '$userDetails'
            },
            {
                $match: {
                    'participants.user_id': { $ne: Number(user_id) }  // Exclude the requesting user
                }
            },
            {
                $group: {
                    _id: '$_id',
                    chat_id: { $first: '$chat_id' },
                    is_group: { $first: '$is_group' },
                    group_id: { $first: '$group_id' },
                    group_name: { $first: '$group_name' },
                    group_picture_url: { $first: '$group_picture_url' },
                    created_at: { $first: '$created_at' },
                    users: {
                        $push: {
                            username: '$userDetails.username',
                            first_name: '$userDetails.first_name',
                            picture_url: '$userDetails.picture_url'
                        }
                    }
                }
            }
        ]);

        if (chats.length === 0) {
            return Promise.reject({ status: 404, message: 'No chats found for this user!' });
        }

        return {
            chats
        };
    } catch (err) {
        console.error('Error fetching chats for user:', err);
        throw err;
    }
};


