const { fetchAllGroups, fetchGroupById, fetchGroupsByUserId, createGroup, updateGroupById, removeGroupById } = require("../models/groups_model")

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


exports.patchGroup = (req, res, next) => {
    const { group_id } = req.params;
    const updates = req.body;

    // Validate group_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    // Pass group_id and updates to the model
    updateGroupById(group_id, updates)
        .then((updatedGroup) => {
            if (!updatedGroup) {
                return res.status(404).send({ message: 'Group not found!' });
            }
            if (updatedGroup.status==400) {
                return res.status(400).send({ message: 'Bad Request: No information was changed'})
            }
            res.status(200).send({ group: updatedGroup });
        })
        .catch((err) => {
            next(err);
        });
};

exports.deleteGroup = (req, res, next) => {
    const { group_id } = req.params;

    // Validate group_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    removeGroupById(group_id)
        .then((deletedGroup) => {
            res.status(200).send({ message: 'Group successfully deleted', group: deletedGroup });
        })
        .catch((err) => {
            next(err);
        });
};