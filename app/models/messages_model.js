const {MessagesModel, UserModel} = require("../../db/seeds/seed")

exports.fetchMessagesForChat = async (chat_id) => {
    try {
        const messages = await MessagesModel.aggregate([
            {
                $match: { chat_id: Number(chat_id) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'sender_id',
                    foreignField: 'user_id',
                    as: 'senderDetails'
                }
            },
            {
                $unwind: {
                    path: '$senderDetails',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    first_name: { $ifNull: ['$senderDetails.first_name', 'Unknown'] }
                }
            },
            {
                $project: {
                    message_id: 1,
                    chat_id: 1,
                    timestamp: 1,
                    sender_id: 1,
                    content: 1,
                    first_name: 1,
                    read_by: 1 
                }
            }
        ]);

        if (messages.length === 0) {
            return Promise.reject({ status: 404, message: 'No messages found for this chat!' });
        }

        return messages;
    } catch (err) {
        console.error('Error fetching messages by chat:', err);
        throw err;
    }
};



exports.fetchLatestMessageFromChat = async (chat_id) => {
    try {
        // Step 1: Fetch the latest message for the specified chat_id
        const latestMessage = await MessagesModel.aggregate([
            {
                $match: { chat_id: Number(chat_id) }
            },
            {
                $sort: { timestamp: -1 }  // Sort by timestamp in descending order
            },
            {
                $limit: 1  // Get the most recent message
            },
            {
                $lookup: {
                    from: UserModel.collection.name,
                    localField: 'sender_id',
                    foreignField: 'user_id',
                    as: 'senderDetails'
                }
            },
            {
                $unwind: '$senderDetails'
            },
            {
                $project: {
                    _id: 0,
                    content: 1,
                    timestamp: 1,
                    username: '$senderDetails.username',  // Include username of the message sender
                    read_by: 1 
                }
            }
        ]);
        if (!latestMessage || latestMessage.length === 0) {
            return Promise.reject({ status: 404, message: 'No messages found for this chat!' });
        }
        return latestMessage[0];
    } catch (err) {
        console.error('Error fetching latest message from chat:', err);
        throw err;
    }
};


exports.createAMessage = async (newMessage) => {
    try {
        // Fetch the latest message_id
        const maxMessage = await MessagesModel.findOne({}, { message_id: 1 }, { sort: { message_id: -1 } });
        const newMessageId = maxMessage ? maxMessage.message_id + 1 : 1;
        
        // Set the default for read_by if not provided
        newMessage.read_by = newMessage.read_by || [newMessage.sender_id];

        const message = new MessagesModel({
            ...newMessage,
            message_id: newMessageId
        });

        // Save the message
        const savedMessage = await message.save();
        return savedMessage;
    } catch (err) {
        console.error('Error creating message:', err);
        throw err;
    }
};


exports.updateMessageById = async (message_id, updates) => {
    try {
        const originalMessage = await MessagesModel.findOne({ message_id: Number(message_id) }).lean();

        if (!originalMessage) {
            throw { status: 404, message: 'Message not found!' };
        }

        // Apply the updates, including updating read_by if present
        const updatedMessage = await MessagesModel.findOneAndUpdate(
            { message_id: Number(message_id) },
            { $set: updates },
            { new: true, lean: true }
        );

        // Compare original and updated message objects
        const isModified = Object.keys(updates).some((key) => {
            return originalMessage[key] !== updatedMessage[key];
        });

        if (!isModified) {
            return { status: 400 };
        }

        return updatedMessage;
    } catch (err) {
        console.error('Error updating message:', err);
        throw err;
    }
};


exports.removeMessageById = async (message_id) => {
    try {
        // Find and delete the message by message_id
        const deletedMessage = await MessagesModel.findOneAndDelete({ message_id: Number(message_id) });

        if (!deletedMessage) {
            throw { status: 404, message: 'Message not found!' };
        }

        return deletedMessage;
    } catch (err) {
        console.error('Error deleting message:', err);
        throw err;
    }
};