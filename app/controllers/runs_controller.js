const { fetchRunsByGroup, fetchRunsById, fetchRunsByUserId } = require("../models/runs_model")


exports.getRunsByGroup = (req, res, next) => {
    const {group_id} = req.params

    // Validate group_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchRunsByGroup(group_id).then((runs) => {
        res.status(200).send({ runs })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getRunById = (req, res, next) => {
    const {run_id} = req.params
    // Validate group_id before database call
    if (isNaN(run_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchRunsById(run_id).then((run) => {
        res.status(200).send(run)
    })
    .catch((err) => {
        next(err)
    })
}

exports.getRunsByUser = (req, res, next) => {
    const { user_id } = req.params;

    // Validate user_id before database call
    if (isNaN(user_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }

    fetchRunsByUserId(user_id).then((runs) => {
        res.status(200).send({ runs });
    })
    .catch((err) => {
        next(err);
    });
};