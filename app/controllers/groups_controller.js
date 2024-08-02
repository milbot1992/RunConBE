const { fetchAllGroups, fetchGroupById, fetchGroupsByUserId, createGroup } = require("../models/groups_model")

exports.getAllGroups = (req, res, next) => {
    const { limit, p } = req.query

    fetchAllGroups(limit, p)
    .then(({ groups, totalGroups}) => {
        res.status(200).send({groups, totalGroups})
    })
    .catch((err) => {
        next(err)
    })
}

exports.getGroupById = (req, res, next) => {
    const {group_id} = req.params
    
    fetchGroupById(group_id).then((group) => {
        res.status(200).send({ group })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getGroupsByUser = (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchGroupsByUserId(user_id).then((groups) => {
        res.status(200).send({ groups });
    })
    .catch((err) => {
        next(err);
    });
};

exports.postGroup = (req, res, next) => {
    const newGroup = req.body;

    createGroup(newGroup)
        .then((group) => {
            res.status(201).send({ group });
        })
        .catch((err) => {
            next(err);
        });
};