const { fetchMessagesForChat, createAMessage, updateMessageById, removeMessageById } = require("../models/messages_model")

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

exports.PostAMessage = (req, res, next) => {
    const newMessage = req.body;

    createAMessage(newMessage)
        .then((message) => {
            res.status(201).send({ message });
        })
        .catch((err) => {
            next(err);
        });
}

exports.patchAMessage = (req, res, next) => {
    const { message_id } = req.params;
    const updates = req.body;

    // Validate message_id before database call
    if (isNaN(message_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    // Pass message_id and updates to the model
    updateMessageById(message_id, updates)
        .then((updatedMessage) => {
            if (!updatedMessage) {
                return res.status(404).send({ message: 'Message not found!' });
            }
            if (updatedMessage.status==400) {
                return res.status(400).send({ message: 'Bad Request: No information was changed'})
            }
            res.status(200).send({ message: updatedMessage });
        })
        .catch((err) => {
            next(err);
        });
};

exports.deleteAMessage = (req, res, next) => {
    const { message_id } = req.params;

    // Validate message_id before database call
    if (isNaN(message_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    removeMessageById(message_id)
        .then((deletedMessage) => {
            res.status(200).send({ message: 'Message successfully deleted', message: deletedMessage });
        })
        .catch((err) => {
            next(err);
        });
};