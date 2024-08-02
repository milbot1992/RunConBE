const { fetchUserById, fetchUsersByGroupId, fetchUsersByRunId, createUser } = require("../models/users_model")

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