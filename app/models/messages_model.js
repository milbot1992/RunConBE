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
                    sender_id: 1,
                    content: 1,
                    timestamp: 1
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