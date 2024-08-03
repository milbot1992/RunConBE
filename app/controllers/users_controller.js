const { fetchUserById, fetchUsersByGroupId, fetchUsersByRunId, createUser, updateUserById, removeUserById } = require("../models/users_model")

exports.getUserById = (req, res, next) => {
    const {user_id} = req.params
    
    fetchUserById(user_id).then((user) => {
        res.status(200).send({ user })
    })
    .catch((err) => {
        next(err)
    })
    }

exports.getUsersByGroup = (req, res, next) => {
    const { group_id } = req.params;

    // Validate user_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchUsersByGroupId(group_id).then((users) => {
        res.status(200).send({ users });
    })
    .catch((err) => {
        next(err);
    });
};

exports.getUsersByRun = (req, res, next) => {
    const { run_id } = req.params;

    // Validate user_id before database call
    if (isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchUsersByRunId(run_id).then((users) => {
        res.status(200).send({ users });
    })
    .catch((err) => {
        next(err);
    });
};

exports.postUser = (req, res, next) => {
    const newUser = req.body;
    createUser(newUser)
        .then((user) => {
            res.status(201).send({ user });
        })
        .catch((err) => {
            next(err);
        });
};

exports.patchUser = (req, res, next) => {
    const { user_id } = req.params;
    const updates = req.body;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    // Pass user_id and updates to the model
    updateUserById(user_id, updates)
        .then((updatedUser) => {
            if (!updatedUser) {
                return res.status(404).send({ message: 'User not found!' });
            }
            if (updatedUser.status==400) {
                return res.status(400).send({ message: 'Bad Request: No information was changed'})
            }
            res.status(200).send({ user: updatedUser });
        })
        .catch((err) => {
            next(err);
        });
};

exports.deleteUser = (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    removeUserById(user_id)
        .then((deletedUser) => {
            res.status(200).send({ message: 'User successfully deleted', user: deletedUser });
        })
        .catch((err) => {
            next(err);
        });
};