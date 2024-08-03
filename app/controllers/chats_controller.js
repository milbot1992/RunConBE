const { fetchChatsForUser } = require("../models/chats_model")

exports.getChatsForUser = (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchChatsForUser(user_id).then((chats) => {
        res.status(200).send(chats);
    })
    .catch((err) => {
        next(err);
    });
};