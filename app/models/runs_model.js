const {RunModel, GroupModel, RouteModel, RouteWaypointsTableModel, UsersAttendingRunsModel} = require("../../db/seeds/seed")

exports.fetchRunsByGroup = async (group_id, future_runs, user_id) => {
    try {
        const now = new Date();
        const dateFilter = future_runs === 'y'
            ? { date: { $gte: now } }
            : { date: { $lt: now } };

        // Fetch the runs that the user is attending
        const userRuns = await UsersAttendingRunsModel.find({ user_id: Number(user_id) }).select('run_id');
        console.log(userRuns);
        const userRunIds = userRuns.map(run => run.run_id); // Extract run_ids

        // Aggregate runs for the given group_id and add the is_user_attending field
        const runs = await RunModel.aggregate([
            {
                $match: {
                    group_id: Number(group_id),
                    ...dateFilter // Apply the date filter
                }
            },
            {
                $addFields: {
                    // Format date as "01 August, 2024"
                    formattedDate: {
                        $dateToString: {
                            format: "%d %B, %Y",
                            date: "$date",
                            timezone: "UTC"
                        }
                    },
                    // Check if the user is attending this run
                    is_user_attending: {
                        $cond: {
                            if: { $in: ["$run_id", userRunIds] }, // If run_id is in user's runs
                            then: "yes",
                            else: "no"
                        }
                    }
                }
            },
            {
                $project: {
                    run_id: 1,
                    group_id: 1,
                    date: "$formattedDate", // Use formatted date
                    time: 1,
                    meeting_point: 1,
                    distance: 1,
                    distance_unit: 1,
                    route_id: 1,
                    is_user_attending: 1 // Include the new field
                }
            }
        ]);

        return runs;
    } catch (err) {
        console.error('Error fetching runs by group:', err);
        throw err;
    }
};




exports.fetchRunsById = async (run_id) => {
    try {
        // Fetch run and route information
        const runData = await RunModel.aggregate([
            { $match: { run_id: Number(run_id) } },
            {
                $lookup: {
                    from: RouteModel.collection.name,
                    localField: 'route_id',
                    foreignField: 'route_id',
                    as: 'routeInfo'
                }
            },
            { $unwind: { path: '$routeInfo', preserveNullAndEmptyArrays: true } }, 
            {
                $project: {
                    run_id: 1,
                    group_id: 1,
                    date: 1,
                    time: 1,
                    meeting_point: 1,
                    distance: 1,
                    distance_unit: 1,
                    route_id: { $ifNull: ['$routeInfo.route_id', null] },
                    route_name: { $ifNull: ['$routeInfo.name', null] }, 
                    route_description: { $ifNull: ['$routeInfo.description', null] } 
                }
            }
        ]);

        if (!runData.length || !runData[0]) {
            return Promise.reject({ status: 404, message: 'Run not found!' });
        }

        // Fetch route waypoints information
        const route_id = runData[0].route_id;
        let routeWaypoints = [];
        if (route_id) {
            routeWaypoints = await RouteWaypointsTableModel.find({ route_id }).exec();
        }

        return {
            run: runData[0],
            waypoints: routeWaypoints
        };
    } catch (err) {
        console.error('Error fetching run by ID:', err);
        throw err;
    }
};


exports.fetchRunsByUserId = async (user_id, future_runs) => {
    try {
        // Define the date criteria based on future_runs
        const now = new Date();
        const dateFilter = future_runs === 'y'
            ? { date: { $gte: now } }
            : { date: { $lt: now } };

        // Aggregate the data by joining UsersAttendingRunsModel with RunModel and GroupModel
        const runs = await UsersAttendingRunsModel.aggregate([
            {
                $match: { user_id: Number(user_id) }
            },
            {
                $lookup: {
                    from: RunModel.collection.name,
                    localField: 'run_id',
                    foreignField: 'run_id',
                    as: 'runDetails'
                }
            },
            {
                $unwind: '$runDetails'
            },
            {
                $replaceRoot: { newRoot: '$runDetails' }
            },
            {
                $match: dateFilter // Apply the date filter
            },
            {
                $lookup: {
                    from: GroupModel.collection.name,
                    localField: 'group_id',
                    foreignField: 'group_id',
                    as: 'groupDetails'
                }
            },
            {
                $unwind: '$groupDetails'
            },
            {
                $addFields: {
                    // Format date as "01 August, 2024"
                    formattedDate: {
                        $dateToString: {
                            format: "%d %B, %Y",
                            date: "$date",
                            timezone: "UTC"
                        }
                    }
                }
            },
            {
                $project: {
                    run_id: 1,
                    group_id: 1,
                    group_name: '$groupDetails.group_name', // Add group_name from GroupModel
                    date: "$formattedDate", // Use the formatted date
                    time: 1, // Time remains the same
                    meeting_point: 1,
                    distance: 1,
                    distance_unit: 1,
                    route_id: 1,
                    location: 1
                }
            }
        ]);

        return runs;
    } catch (err) {
        console.error('Error fetching runs by user:', err);
        throw err;
    }
};




exports.fetchUpcomingRunForGroup = async (group_id) => {
    try {
        // Fetch all runs for the given group
        const runs = await RunModel.find({ group_id }).exec();

        // Get today's date
        const today = new Date();

        // Filter runs to include only those after today
        const upcomingRuns = runs.filter(run => new Date(run.date) > today);

        // Sort upcoming runs by date
        const sortedUpcomingRuns = upcomingRuns.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Return the earliest upcoming run
        if (sortedUpcomingRuns.length > 0) {
            return new Date(sortedUpcomingRuns[0].date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else {
            return "No upcoming runs yet";
        }
    } catch (err) {
        console.error('Error fetching upcoming run for group:', err);
        throw err;
    }
};

exports.createRun = async (newRun) => {
    try {
        // Fetch the latest user_id
        const maxRun = await RunModel.findOne({}, { run_id: 1 }, { sort: { run_id: -1 } });
        const newRunId = maxRun ? maxRun.run_id + 1 : 1;
        
        // Create the new user with the new user_id
        const run = new RunModel({
            ...newRun,  
            run_id: newRunId 
        });

        // Save the user
        const savedRun = await run.save();
        return savedRun;
    } catch (err) {
        console.error('Error creating run:', err);
        throw err;
    }
};

exports.createUserAttendingRun = async (newUserRun) => {
    try {
        // Create the new userRun
        const userRun = new UsersAttendingRunsModel({
            ...newUserRun
        });

        // Save the userRun
        const savedUserRun = await userRun.save();
        return savedUserRun;
    } catch (err) {
        console.error('Error creating userRun:', err);
        throw err;
    }
};

exports.updateRunById = async (run_id, updates) => {
    try {
        // Find the original run by run_id and convert to plain object
        const originalRun = await RunModel.findOne({ run_id: Number(run_id) }).lean();

        if (!originalRun) {
            throw { status: 404, message: 'Run not found!' };
        }

        // Create a copy of the original run object for comparison
        const originalRunObject = { ...originalRun }; 

        // Apply the updates
        const updatedRun = await RunModel.findOneAndUpdate(
            { run_id: Number(run_id) },
            { $set: updates },
            { new: true, lean: true } // Use lean to get a plain object
        );

        // Create a copy of the updated run object for comparison
        const updatedRunObject = { ...updatedRun };

        // Remove `_id` and other non-updatable fields from the comparison
        delete originalRunObject._id;
        delete originalRunObject.__v;
        delete updatedRunObject._id;
        delete updatedRunObject.__v;

        // Compare the original and updated run objects
        const isModified = Object.keys(updates).some((key) => {
            return originalRunObject[key] !== updatedRunObject[key];
        });

        if (!isModified) {
            return { status: 400};
        }

        return updatedRun;
    } catch (err) {
        console.error('Error updating run:', err);
        throw err;
    }
};

exports.removeRunById = async (run_id) => {
    try {
        // Find and delete the run by run_id
        const deletedRun = await RunModel.findOneAndDelete({ run_id: Number(run_id) });

        if (!deletedRun) {
            throw { status: 404, message: 'Run not found!' };
        }

        return deletedRun;
    } catch (err) {
        console.error('Error deleting run:', err);
        throw err;
    }
};

exports.removeUserAttendingRunById = async (user_id, run_id) => {
    try {
        // Find and delete the user attending run by user_id and run_id
        const deletedUserRun = await UsersAttendingRunsModel.findOneAndDelete({ user_id: Number(user_id), run_id: Number(run_id) });

        if (!deletedUserRun) {
            throw { status: 404, message: 'User or Run not found!' };
        }

        return deletedUserRun;
    } catch (err) {
        console.error('Error removing user from run:', err);
        throw err;
    }
};
