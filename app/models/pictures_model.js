const {PicturesModel} = require("../../db/seeds/seed")

exports.fetchPicturesByGroup = async (group_id) => {
    try {
        // Aggregate the data by finding pictures with the given group_id
        const pictures = await PicturesModel.aggregate([
            {
                $match: { group_id: Number(group_id) }
            },
        ]);

        if (pictures.length === 0) {
            return Promise.reject({ status: 404, message: 'No pictures found for this group!' });
        }
        return pictures;
    } catch (err) {
        console.error('Error fetching pictures by group:', err);
        throw err;
    }
};