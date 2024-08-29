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
    return GroupModel.find({ group_id })
        .then((group) => {
            if (group.length === 0) {
                return Promise.reject({ status: 404, message: 'Group Does Not Exist!' });
            }

            // Format the created_at field
            const formattedCreatedAt = new Date(group[0].created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });

            // Return the group with the formatted created_at
            return {
                ...group[0].toObject(),
                created_at: formattedCreatedAt,
            };
        });
};


exports.fetchGroupsByUserId = async (user_id) => {
    try {
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();

        if (userGroups.length === 0) {
            return Promise.reject({ status: 404, message: 'User is not part of any group!' });
        }

        const groupIdsWithJoinDates = userGroups.map(entry => ({
            group_id: entry.group_id,
            user_joined_group: new Date(entry.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }) // Format the user_joined_group date
        }));

        const groupIds = groupIdsWithJoinDates.map(entry => entry.group_id);

        const groups = await GroupModel.find({ group_id: { $in: groupIds } }).exec();

        if (groups.length === 0) {
            return Promise.reject({ status: 404, message: 'No groups found for the given user.' });
        }

        const groupsWithJoinAndCreationDates = groups.map(group => {
            const groupWithJoinDate = groupIdsWithJoinDates.find(entry => entry.group_id.toString() === group.group_id.toString());

            return {
                ...group.toObject(),
                user_joined_group: groupWithJoinDate ? groupWithJoinDate.user_joined_group : null,
                created_at: new Date(group.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                }) // Format the group's created_at date
            };
        });

        return groupsWithJoinAndCreationDates;
    } catch (err) {
        console.error('Error fetching user groups:', err);
        throw err;
    }
};


exports.fetchGroupsNotInUserGroups = async (user_id) => {
    try {
        // Find all user groups
        const userGroups = await UsersRunningGroupsModel.find({ user_id }).exec();
        
        // Extract group_ids
        const userGroupIds = userGroups.map(entry => entry.group_id);

        // Find all groups that are not part of the user's groups
        const groups = await GroupModel.find({ group_id: { $nin: userGroupIds } }).exec();

        if (groups.length === 0) {
            return Promise.reject({ status: 404, message: 'No groups found that the user is not a part of.' });
        }

        // Reformat created_at field for each group
        const formattedGroups = groups.map(group => ({
            ...group.toObject(),
            created_at: new Date(group.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        }));

        return formattedGroups;
    } catch (err) {
        console.error('Error fetching groups not in user groups:', err);
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