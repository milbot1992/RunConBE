const { fetchPicturesByGroup } = require("../models/pictures_model")


exports.getPicturesForGroup = (req, res, next) => {
    const {group_id} = req.params

    // Validate group_id before database call
    if (isNaN(group_id)) {
        return res.status(400).send({ message: 'Bad Request' });
    }
    
    fetchPicturesByGroup(group_id).then((pictures) => {
        res.status(200).send({ pictures })
    })
    .catch((err) => {
        next(err)
    })
}