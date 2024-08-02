const request = require("supertest");
const app = require("../app/app");
const db = require("../connection");
const {seedData} = require("../db/seeds/seed");
const { GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel } = require("../db/seeds/seed");
const {groupData, userData, usersRunningGroupsData, runData, usersAttendingRunsData, routeData, routeWaypointsData} = require("../db/data/test-data/index");
const sorted = require("jest-sorted");
const mongoose = require("mongoose");

beforeEach(async () => await seedData({groupData, userData, usersRunningGroupsData, runData, usersAttendingRunsData, routeData, routeWaypointsData}, GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel));

afterAll(() => mongoose.connection.close());


describe('GET /api/groups', () => {
    test('should return a 200 status code ', () => {
        return request(app).get("/api/groups").expect(200)
    });
    test('an array of group objects should be returned', () => {
        return request(app).get("/api/groups").expect(200).then(({body}) => {
            expect(body.groups).toHaveLength(6)
        })
    });
    test('return a 404 error when given a wrong path ', () => {
        return request(app).get("/api/banana").expect(404).then(({body}) => {
        })
    });
    test('should limit the number of users returned', () => {
        return request(app)
            .get('/api/groups?limit=3')
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.groups)).toBe(true);
                expect(body.groups).toHaveLength(3);
            });
    });
    test('should paginate results', () => {
        return request(app)
            .get('/api/groups?limit=3&p=2')
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.groups)).toBe(true);
                expect(body.groups).toHaveLength(3);
                expect(body.totalGroups).toBe(6)
            });
    });
});

describe('GetUserById GET /api/users/user/:user_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/users/user/1").expect(200)
    }); 
    test('returns a user by the id with the following properties', () => {
        return request(app).get("/api/users/user/2").expect(200).then(({body}) => {
            expect(body.user).toHaveProperty("user_id", expect.any(Number));
            expect(body.user).toHaveProperty("username", expect.any(String));
            expect(body.user).toHaveProperty("first_name", expect.any(String));
            expect(body.user).toHaveProperty("second_name", expect.any(String));
            expect(body.user).toHaveProperty("gender", expect.any(String));
            expect(body.user).toHaveProperty("single_open", expect.any(Boolean));
            expect(body.user).toHaveProperty("connect_open", expect.any(Boolean));
            expect(body.user).toHaveProperty("open_to_gender", expect.any(String));
            })
        });
    test("should return a status code of 404 Not Found for a user_id that does not exist", () => {
        return request(app)
            .get("/api/users/user/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('User Does Not Exist!')
            });
    });
});

describe('GetGroupById GET /api/groups/group/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/groups/group/1").expect(200)
    }); 
    test('returns a group by the id with the following properties', () => {
        return request(app).get("/api/groups/group/2").expect(200).then(({body}) => {
            expect(body.group).toHaveProperty("group_id", expect.any(Number));
            expect(body.group).toHaveProperty("group_name", expect.any(String));
            expect(body.group).toHaveProperty("description", expect.any(String));
            })
        });
    test("should return a status code of 404 Not Found for a group_id that does not exist", () => {
        return request(app)
            .get("/api/groups/group/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('Group Does Not Exist!')
            });
    });
});

describe('GetGroupsByUser GET /groups/user/:user_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/groups/user/1").expect(200)
    }); 
    test('returns a group by the id with the following properties', () => {
        return request(app).get("/api/groups/user/2").expect(200).then(({body}) => {
            expect(body.groups[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.groups[0]).toHaveProperty("group_name", expect.any(String));
            expect(body.groups[0]).toHaveProperty("description", expect.any(String));
            })
        });
    test('returns a group with the correct properties for user_id 2', () => {
        return request(app)
            .get("/api/groups/user/2")
            .expect(200)
            .then(({ body }) => {
                expect(body.groups[0]).toEqual(expect.objectContaining({
                    group_id: 6,
                    group_name: "test6",
                    description: "sixth running group for testing"
                }));
            });
    });
    test('returns a status code of 404 Not Found for a user_id that is not part of any group', () => {
        return request(app)
            .get("/api/groups/user/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('User is not part of any group!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid user_id format', () => {
        return request(app)
            .get("/api/groups/user/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetUsersByGroup GET /users/group/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/users/group/1").expect(200)
    }); 
    test('returns users belonging to group id with the following properties', () => {
        return request(app).get("/api/users/group/2").expect(200).then(({body}) => {
            expect(body.users[0]).toHaveProperty("user_id", expect.any(Number));
            expect(body.users[0]).toHaveProperty("username", expect.any(String));
            expect(body.users[0]).toHaveProperty("first_name", expect.any(String));
            expect(body.users[0]).toHaveProperty("second_name", expect.any(String));
            expect(body.users[0]).toHaveProperty("gender", expect.any(String));
            expect(body.users[0]).toHaveProperty("single_open", expect.any(Boolean));
            expect(body.users[0]).toHaveProperty("connect_open", expect.any(Boolean));
            expect(body.users[0]).toHaveProperty("open_to_gender", expect.any(String));
            })
        });
    test('returns a user with the correct properties for group_id 1', () => {
        return request(app)
            .get("/api/users/group/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.users[0]).toEqual(expect.objectContaining({
                    username: "user1",
                    first_name: "Alice",
                    second_name: "Smith",
                    gender: "female",
                    single_open: true,
                    connect_open: true,
                    open_to_gender: "male"
                }));
            });
    });
    test('returns a status code of 404 Not Found for a group_id that has no users', () => {
        return request(app)
            .get("/api/users/group/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No users found for this group!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid group_id format', () => {
        return request(app)
            .get("/api/users/group/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetUsersByRun GET /users/run/:run_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/users/run/1").expect(200)
    }); 
    test('returns the correct number of users for run_id 1', () => {
        return request(app)
            .get("/api/users/run/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.users.length).toBe(2);
            });
    });
    test('returns users attending a specified run_id with the following properties', () => {
        return request(app).get("/api/users/run/2").expect(200).then(({body}) => {
            expect(body.users[0]).toHaveProperty("user_id", expect.any(Number));
            expect(body.users[0]).toHaveProperty("username", expect.any(String));
            expect(body.users[0]).toHaveProperty("first_name", expect.any(String));
            expect(body.users[0]).toHaveProperty("second_name", expect.any(String));
            expect(body.users[0]).toHaveProperty("gender", expect.any(String));
            expect(body.users[0]).toHaveProperty("single_open", expect.any(Boolean));
            expect(body.users[0]).toHaveProperty("connect_open", expect.any(Boolean));
            expect(body.users[0]).toHaveProperty("open_to_gender", expect.any(String));
            })
        });
    test('returns a user with the correct properties for run_id 3', () => {
        return request(app)
            .get("/api/users/run/3")
            .expect(200)
            .then(({ body }) => {
                expect(body.users[0]).toEqual(expect.objectContaining({
                    username: "user5",
                    first_name: "Eve",
                    second_name: "Jones",
                    gender: "female",
                    single_open: true,
                    connect_open: true,
                    open_to_gender: "male"
                }));
            });
    });
    test('returns a status code of 404 Not Found for a run_id that has no users', () => {
        return request(app)
            .get("/api/users/run/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No users found for this run!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid run_id format', () => {
        return request(app)
            .get("/api/users/run/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetRunsByGroup GET /runs/group/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/runs/group/1").expect(200)
    }); 
    test('returns the correct number of runs for group_id 2', () => {
        return request(app)
            .get("/api/runs/group/2")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(2);
            });
    });
    test('returns runs for a specified group with the following properties', () => {
        return request(app).get("/api/runs/group/1").expect(200).then(({body}) => {
            expect(body.runs[0]).toHaveProperty("run_id", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("date", expect.any(String));
            expect(body.runs[0]).toHaveProperty("time", expect.any(String));
            expect(body.runs[0]).toHaveProperty("meeting_point", expect.any(String));
            expect(body.runs[0]).toHaveProperty("distance", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("distance_unit", expect.any(String));
            expect(body.runs[0]).toHaveProperty("route_id", expect.any(Number));
            })
        });
    test('returns a run with the correct properties for group_id 1', () => {
        return request(app)
            .get("/api/runs/group/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs[0]).toEqual(expect.objectContaining({
                    group_id: 1,
                    date: "2024-08-01T00:00:00.000Z", 
                    time: "07:30", 
                    meeting_point: 'Central Park Entrance',
                    distance: 5,
                    distance_unit: "km",
                    route_id: 1,
                }));
            });
    });
    test('returns a status code of 404 Not Found for a run_id that has no users', () => {
        return request(app)
            .get("/api/runs/group/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No runs found for this group!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid run_id format', () => {
        return request(app)
            .get("/api/runs/group/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetRunsById GET /runs/run/:run_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/runs/run/1").expect(200);
    });
    test('returns a run with the correct properties', () => {
        return request(app).get("/api/runs/run/1").expect(200).then(({ body }) => {
            expect(body.run).toHaveProperty("run_id", expect.any(Number));
            expect(body.run).toHaveProperty("group_id", expect.any(Number));
            expect(body.run).toHaveProperty("date", expect.any(String));
            expect(body.run).toHaveProperty("time", expect.any(String));
            expect(body.run).toHaveProperty("meeting_point", expect.any(String));
            expect(body.run).toHaveProperty("distance", expect.any(Number));
            expect(body.run).toHaveProperty("distance_unit", expect.any(String));
            expect(body.run).toHaveProperty("route_id", expect.any(Number));
            expect(body.run).toHaveProperty("route_name", expect.any(String));
            expect(body.run).toHaveProperty("route_description", expect.any(String));
        });
    });
    test('returns the correct waypoints for the run', () => {
        return request(app).get("/api/runs/run/1").expect(200).then(({ body }) => {
            expect(body.waypoints).toBeInstanceOf(Array);
            expect(body.waypoints.length).toBeGreaterThan(0);
            expect(body.waypoints[0]).toHaveProperty("waypoint_id", expect.any(Number));
            expect(body.waypoints[0]).toHaveProperty("route_id", expect.any(Number));
            expect(body.waypoints[0]).toHaveProperty("latitude", expect.any(Number));
            expect(body.waypoints[0]).toHaveProperty("longitude", expect.any(Number));
            expect(body.waypoints[0]).toHaveProperty("sequence", expect.any(Number));
        });
    });

    test('returns a run with the correct properties for a specific run_id', () => {
        return request(app)
            .get("/api/runs/run/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.run).toEqual(expect.objectContaining({
                    run_id: 1,
                    group_id: 1,
                    date: "2024-08-01T00:00:00.000Z", 
                    time: "07:30", 
                    meeting_point: 'Central Park Entrance',
                    distance: 5,
                    distance_unit: "km",
                    route_id: 1,
                    route_name: "Central Park Loop",
                    route_description: "A scenic loop around Central Park."
                }));
            });
    });
    test('returns a status code of 404 Not Found for a non-existing run_id', () => {
        return request(app)
            .get("/api/runs/run/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('Run not found!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid run_id format', () => {
        return request(app)
            .get("/api/runs/run/invalid_run_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetRunsByUser GET /api/runs/user/:user_id', () => {
    test('returns a 200 status code for a valid user', () => {
        return request(app).get("/api/runs/user/1").expect(200);
    });
    test('returns the correct number of runs for user_id 1', () => {
        return request(app)
            .get("/api/runs/user/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(1);
            });
    });
    test('returns runs for a specified user with the following properties', () => {
        return request(app).get("/api/runs/user/1").expect(200).then(({ body }) => {
            expect(body.runs[0]).toHaveProperty("run_id", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("date", expect.any(String));
            expect(body.runs[0]).toHaveProperty("time", expect.any(String));
            expect(body.runs[0]).toHaveProperty("meeting_point", expect.any(String));
            expect(body.runs[0]).toHaveProperty("distance", expect.any(Number));
            expect(body.runs[0]).toHaveProperty("distance_unit", expect.any(String));
            expect(body.runs[0]).toHaveProperty("route_id", expect.any(Number));
        });
    });
    test('returns a run with the correct properties for user_id 1', () => {
        return request(app)
            .get("/api/runs/user/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs[0]).toEqual(expect.objectContaining({
                    run_id: 1,
                    group_id: 1,
                    date: "2024-08-01T00:00:00.000Z", 
                    time: "07:30", 
                    meeting_point: 'Central Park Entrance',
                    distance: 5,
                    distance_unit: "km",
                    route_id: 1,
                }));
            });
    });
    test('returns a status code of 404 Not Found for a user_id that has no runs', () => {
        return request(app)
            .get("/api/runs/user/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No runs found for this user!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid user_id format', () => {
        return request(app)
            .get("/api/runs/user/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('POST /api/groups', () => {
    test('should return 201 status code and return the new posted group', () => {
        const newGroup = {
            group_name: "New Group",
            description: "A new group description",
        };
        return request(app)
            .post('/api/groups')
            .send(newGroup)
            .expect(201)
            .then((res) => {
                expect(res.body.group).toMatchObject({
                    group_name: "New Group",
                    description: "A new group description",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 201 status code and return the new posted group when passed a request with an extra field', () => {
        const newGroup = {
            group_name: "New Group",
            description: "A new group description",
            extraKey: 'extraValue'
        };
        return request(app)
            .post('/api/groups')
            .send(newGroup)
            .expect(201)
            .then((res) => {
                expect(res.body.group).toMatchObject({
                    group_name: "New Group",
                    description: "A new group description",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 400 Bad Request if the group data is invalid', () => {
        const invalidGroup = {
            nme: 'New Group 2',
            description: 'new group2 description'
        };
        return request(app)
            .post('/api/groups')
            .send(invalidGroup)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
    test('should return a 400 Bad Request if the object passed is missing required properties - missing key name', () => {
        const invalidGroup = {
            description: "A new group description",
            // Missing name field
        };
        return request(app)
            .post('/api/groups')
            .send(invalidGroup)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
});

describe('POST /api/users', () => {
    test('should return 201 status code and return the new posted user', () => {
        const newUser = {
            username: "newuser7",
            first_name: "Grace",
            second_name: "Lee",
            gender: "female",
            single_open: true,
            connect_open: false,
            open_to_gender: "male"
        };
        return request(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .then((res) => {
                expect(res.body.user).toMatchObject({
                    username: "newuser7",
                    first_name: "Grace",
                    second_name: "Lee",
                    gender: "female",
                    single_open: true,
                    connect_open: false,
                    open_to_gender: "male",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 201 status code and return the new posted group when passed a request with an extra field', () => {
        const newUser = {
            username: "newuser8",
            first_name: "Dave",
            second_name: "Lee",
            gender: "male",
            single_open: true,
            connect_open: false,
            open_to_gender: "male",
            smells_like: "roses"
        };
        return request(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .then((res) => {
                expect(res.body.user).toMatchObject({
                    username: "newuser8",
                    first_name: "Dave",
                    second_name: "Lee",
                    gender: "male",
                    single_open: true,
                    connect_open: false,
                    open_to_gender: "male",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 400 Bad Request if the user data is invalid', () => {
        const invalidUser = {
            usernme: "newuser8",
            first_name: "Dave",
            second_name: "Lee",
            gender: "male",
            single_open: true,
            connect_open: false,
            open_to_gender: "male",
        };
        return request(app)
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
    test('should return a 400 Bad Request if the object passed is missing required properties - missing key name', () => {
        const invalidUser = {
            first_name: "Dave",
            second_name: "Lee",
            gender: "male",
            single_open: true,
            connect_open: false,
            open_to_gender: "male",
            // Missing username field
        };
        return request(app)
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
});