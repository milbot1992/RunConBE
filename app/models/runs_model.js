const mongoose = require('mongoose')
const {RunModel, RouteModel, RouteWaypointsTableModel, UsersAttendingRunsModel} = require("../../db/seeds/seed")

exports.fetchRunsByGroup = async (group_id) => {
    try {
        // Aggregate the data by finding runs with the given group_id
        const runs = await RunModel.aggregate([
            {
                $match: { group_id: Number(group_id) }
            },
            {
                $project: {
                    run_id: 1,
                    group_id: 1,
                    date: 1,
                    time: 1,
                    meeting_point: 1,
                    distance: 1,
                    distance_unit: 1,
                    route_id: 1
                }
            }
        ]);

        if (runs.length === 0) {
            return Promise.reject({ status: 404, message: 'No runs found for this group!' });
        }
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


exports.fetchRunsByUserId = async (user_id) => {
    try {
        // Aggregate the data by joining UsersRunningGroupsModel and UserModel on user_id
        const runs = await UsersAttendingRunsModel.aggregate([
            {
                $match: { user_id : Number(user_id) }
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
            }
        ]);
        if (runs.length === 0) {
            return Promise.reject({ status: 404, message: 'No runs found for this user!' });
        }

        return runs;
    } catch (err) {
        console.error('Error fetching runs by user:', err);
        throw err;
    }
};