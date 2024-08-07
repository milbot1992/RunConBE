const {MessagesModel} = require("../../db/seeds/seed")

exports.fetchMessagesForChat = async (chat_id) => {
    try {
        // Aggregate the data by finding messages with the given chat_id
        const messages = await MessagesModel.aggregate([
            {
                $match: { chat_id: Number(chat_id) }
            },
            {
                $project: {
                    message_id: 1,
                    chat_id: 1,
                    timestamp: 1,
                    sender_id: 1,
                    content: 1,
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

exports.createAMessage = async (newMessage) => {
    try {
        // Fetch the latest message_id
        const maxMessage = await MessagesModel.findOne({}, { message_id: 1 }, { sort: { message_id: -1 } });
        const newMessageId = maxMessage ? maxMessage.message_id + 1 : 1;
        
        // Create the new message with the new message_id
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
}

exports.updateMessageById = async (message_id, updates) => {
    try {
        // Find the original message by message_id and convert to plain object
        const originalMessage = await MessagesModel.findOne({ message_id: Number(message_id) }).lean();

        if (!originalMessage) {
            throw { status: 404, message: 'Message not found!' };
        }

        // Create a copy of the original message object for comparison
        const originalMessageObject = { ...originalMessage }; 

        // Apply the updates
        const updatedMessage = await MessagesModel.findOneAndUpdate(
            { message_id: Number(message_id) },
            { $set: updates },
            { new: true, lean: true } // Use lean to get a plain object
        );

        // Create a copy of the updated message object for comparison
        const updatedMessageObject = { ...updatedMessage };

        // Remove `_id` and other non-updatable fields from the comparison
        delete originalMessageObject._id;
        delete originalMessageObject.__v;
        delete updatedMessageObject._id;
        delete updatedMessageObject.__v;

        // Compare the original and updated message objects
        const isModified = Object.keys(updates).some((key) => {
            return originalMessageObject[key] !== updatedMessageObject[key];
        });

        if (!isModified) {
            return { status: 400};
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