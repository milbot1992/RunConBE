const { fetchMessagesForChat } = require("../models/messages_model")

exports.GetMessagesForChat = (req, res, next) => {
    const { chat_id } = req.params;

    // Validate chat_id before database call
    if (isNaN(chat_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchMessagesForChat(chat_id).then((messages) => {
        res.status(200).send({messages});
    })
    .catch((err) => {
        next(err);
    });
};