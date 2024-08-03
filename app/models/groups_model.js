const {GroupModel,UsersRunningGroupsModel} = require("../../db/seeds/seed")

exports.fetchAllGroups = async (limit = 10, p = 1) => {
    try {
        const offset = (p - 1) * limit;
        
        // Fetch groups with pagination
        const groups = await GroupModel.find({})
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sorting by creation date, adjust as needed

        // Count total number of groups
        const totalGroups = await GroupModel.countDocuments({});
        
        // Return formatted response
        return {
            currentPage: p,
            totalPages: Math.ceil(totalGroups / limit),
            totalGroups,
            groups,
        };
    } catch (err) {
        console.error('Error fetching groups:', err);
        throw err; 
    }
};

exports.fetchGroupById = (group_id) => {

    return GroupModel.find({group_id})
        .then((group) => {

            if (group.length === 0) {
                return Promise.reject({ status: 404, message: 'Group Does Not Exist!' });
            }

            return group[0];
        });
};

exports.fetchGroupsByUserId = async (user_id) => {
    try {
        // Find all user groups
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'User is not part of any group!' });
        }

        // Extract group_ids
        const groupIds = userGroups.map(entry => entry.group_id);

        // Find all groups with the extracted group_ids
        const groups = await GroupModel.find({ group_id: { $in: groupIds } }).exec();

        if (groups.length === 0) {
            return Promise.reject({ status: 404, message: 'No groups found for the given user.' });
        }

        return groups;
    } catch (err) {
        console.error('Error fetching user groups:', err);
        throw err;
    }
};

exports.createGroup = async (newGroup) => {
    try {
        // Fetch the latest group_id
        const maxGroup = await GroupModel.findOne({}, { group_id: 1 }, { sort: { group_id: -1 } });
        const newGroupId = maxGroup ? maxGroup.group_id + 1 : 1;
        
        // Create the new group with the new group_id
        const group = new GroupModel({
            ...newGroup,  
            group_id: newGroupId 
        });

        // Save the group
        const savedGroup = await group.save();
        return savedGroup;
    } catch (err) {
        console.error('Error creating group:', err);
        throw err;
    }
};

exports.updateGroupById = async (group_id, updates) => {
    try {
        // Find the original group by group_id and convert to plain object
        const originalGroup = await GroupModel.findOne({ group_id: Number(group_id) }).lean();

        if (!originalGroup) {
            throw { status: 404, message: 'Group not found!' };
        }

        // Create a copy of the original user object for comparison
        const originalGroupObject = { ...originalGroup }; 

        // Apply the updates
        const updatedGroup = await GroupModel.findOneAndUpdate(
            { group_id: Number(group_id) },
            { $set: updates },
            { new: true, lean: true } // Use lean to get a plain object
        );

        // Create a copy of the updated user object for comparison
        const updatedGroupObject = { ...updatedGroup };

        // Remove `_id` and other non-updatable fields from the comparison
        delete originalGroupObject._id;
        delete originalGroupObject.__v;
        delete updatedGroupObject._id;
        delete updatedGroupObject.__v;

        // Compare the original and updated user objects
        const isModified = Object.keys(updates).some((key) => {
            return originalGroupObject[key] !== updatedGroupObject[key];
        });

        if (!isModified) {
            return { status: 400};
        }

        return updatedGroup;
    } catch (err) {
        console.error('Error updating group:', err);
        throw err;
    }
};

exports.removeGroupById = async (group_id) => {
    try {
        // Find and delete the group by group_id
        const deletedGroup = await GroupModel.findOneAndDelete({ group_id: Number(group_id) });

        if (!deletedGroup) {
            throw { status: 404, message: 'Group not found!' };
        }

        return deletedGroup;
    } catch (err) {
        console.error('Error deleting group:', err);
        throw err;
    }
};