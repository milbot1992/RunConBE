const request = require("supertest");
const app = require("../app/app");
const db = require("../connection");
const {seedData} = require("../db/seeds/seed");
const { GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel, ChatsModel, ChatParticipantsModel, MessagesModel, PostsModel, PicturesModel } = require("../db/seeds/seed");
const {groupData, userData, usersRunningGroupsData, runData, usersAttendingRunsData, routeData, routeWaypointsData, chatData, chatParticipantData, messagesData, postsData, picturesData} = require("../db/data/test-data/index");
const sorted = require("jest-sorted");
const mongoose = require("mongoose");

beforeEach(async () => await seedData({groupData, userData, usersRunningGroupsData, runData, usersAttendingRunsData, routeData, routeWaypointsData, chatData, chatParticipantData, messagesData, postsData, picturesData}, GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel, ChatsModel, ChatParticipantsModel, MessagesModel, PostsModel, PicturesModel));

afterAll(() => mongoose.connection.close());


describe('GetAllGroups GET /api/groups', () => {
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
            expect(body.group).toHaveProperty("location", expect.any(Array));
            expect(body.group).toHaveProperty("group_name", expect.any(String));
            expect(body.group).toHaveProperty("description", expect.any(String));
            expect(body.group).toHaveProperty("created_at", expect.any(String));
            expect(body.group).toHaveProperty("latest_update", expect.any(String));
            })
        });
    test('returns a group with the correct properties for user_id 2', () => {
        return request(app)
            .get("/api/groups/group/2")
            .expect(200)
            .then(({ body }) => {
                expect(body.group).toEqual(expect.objectContaining({
                    group_id: 2,
                    group_name: "test2",
                    picture_url: "exampleurl2",
                    description: "second running group for testing",
                    location: [53.515024, -2.074472],
                    created_at: expect.any(String),
                    latest_update: "Next run on Monday 7th"
                }));
            });
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
            expect(body.groups[0]).toHaveProperty("location", expect.any(Array));
            expect(body.groups[0]).toHaveProperty("group_name", expect.any(String));
            expect(body.groups[0]).toHaveProperty("description", expect.any(String));
            expect(body.groups[0]).toHaveProperty("created_at", expect.any(String));
            expect(body.groups[0]).toHaveProperty("latest_update", expect.any(String));
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
                    description: "sixth running group for testing",
                    picture_url: "exampleurl6",
                    description: "sixth running group for testing",
                    location: [53.436908, -2.283158],
                    latest_update: "Next run on Monday 7th"
                    
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

describe.only('GetRunsByGroup GET /runs/group/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/runs/group/1").expect(200)
    }); 
    test('returns the correct number of runs for group_id 2 future runs', () => {
        return request(app)
            .get("/api/runs/group/2?future_runs=y")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(0);
            });
    });
    test('returns the correct number of runs for group_id 2 past runs', () => {
        return request(app)
            .get("/api/runs/group/2?future_runs=n")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(2);
            });
    });
    test('returns the correct number of runs for group_id 4 past runs', () => {
        return request(app)
            .get("/api/runs/group/4?future_runs=n")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(0);
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
    test('returns an empty array for a group that has no runs', () => {
        return request(app)
            .get("/api/runs/group/99")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(0);
            });
    });
    test('returns a status code of 400 Bad Request for an invalid group_id format', () => {
        return request(app)
            .get("/api/runs/group/invalid_group_id")
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
            expect(body.runs[0]).toHaveProperty("location", expect.any(Array));
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
                    location: [53.474524, -2.242604]
                }));
            });
    });
    test('returns runs length 0 for a user_id that has no runs', () => {
        return request(app)
            .get("/api/runs/user/99")
            .expect(200)
            .then(({ body }) => {
                expect(body.runs.length).toBe(0);
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

describe('POST /api/runs', () => {
    test('should return 201 status code and return the new posted run', () => {
        const newRun = {
            group_id: 3,
            date: new Date('2024-10-01'), 
            time: "07:45", 
            meeting_point: 'Central Plaza Entrance',
            distance: 5,
            distance_unit: "km",
            route_id: 2,
            location: [53.474524, -2.242604]
        };
        return request(app)
            .post('/api/runs')
            .send(newRun)
            .expect(201)
            .then((res) => {
                expect(res.body.run).toMatchObject({
                    run_id: 5,
                    group_id: 3,
                    date: "2024-10-01T00:00:00.000Z", 
                    time: "07:45", 
                    meeting_point: 'Central Plaza Entrance',
                    distance: 5,
                    distance_unit: "km",
                    route_id: 2,
                    location: [53.474524, -2.242604]
                });
            });
    });
    test('should return 201 status code and return the new posted run when passed a request with an extra field', () => {
        const newRun = {
            group_id: 3,
            date: new Date('2024-10-01'), 
            time: "07:45", 
            meeting_point: 'Local Park Entrance',
            distance: 5,
            distance_unit: "km",
            route_id: 3,
            location: [53.474524, -2.242604],
            difficulty: "extreme"
        };
        return request(app)
            .post('/api/runs')
            .send(newRun)
            .expect(201)
            .then((res) => {
                expect(res.body.run).toMatchObject({
                    run_id: 5,
                    group_id: 3,
                    date: "2024-10-01T00:00:00.000Z", 
                    time: "07:45", 
                    meeting_point: 'Local Park Entrance',
                    distance: 5,
                    distance_unit: "km",
                    route_id: 3,
                    location: [53.474524, -2.242604]
                });
            });
    });
    test('should return 400 Bad Request if the user data is invalid', () => {
        const invalidRun = {
            grp_id: 3,
            date: new Date('2024-10-01'), 
            time: "07:45", 
            meeting_point: 'Local Park Entrance',
            distance: 5,
            distance_unit: "km",
            route_id: 3,
            location: [53.474524, -2.242604],
            difficulty: "extreme"
        };
        return request(app)
            .post('/api/runs')
            .send(invalidRun)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
    test('should return a 400 Bad Request if the object passed is missing required properties - missing key name', () => {
        const invalidRun = {
            date: new Date('2024-10-01'), 
            time: "07:45", 
            meeting_point: 'Local Park Entrance',
            distance: 5,
            distance_unit: "km",
            route_id: 3,
            location: [53.474524, -2.242604],
            difficulty: "extreme"
        };
        return request(app)
            .post('/api/runs')
            .send(invalidRun)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
});

describe("PATCH /api/runs/:run_id", () => {
    test("should return status code 200 and update the run details", () => {
        const updateBody = { date: "2024-09-01", meeting_point: "New Location" };
        return request(app)
            .patch("/api/runs/1") 
            .send(updateBody)
            .expect(200)
            .then(({ body }) => {
                expect(body.run).toHaveProperty("run_id");
                expect(body.run.date).toEqual("2024-09-01T00:00:00.000Z");
                expect(body.run.meeting_point).toEqual("New Location");
            });
    });
    test("should return status code 400 when the run_id is invalid", () => {
        const updateBody = { date: "2024-09-01" };
        return request(app)
            .patch("/api/runs/invalid_id")
            .send(updateBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request");
            });
    });
    test("should return status code 404 for a run_id that doesn't exist", () => {
        const updateBody = { date: "2024-09-01" };
        return request(app)
            .patch("/api/runs/9999") 
            .send(updateBody)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("Run not found!");
            });
    });
    test("should return status code 400 when the request body is missing required fields", () => {
        return request(app)
            .patch("/api/runs/1")
            .send({}) // Send an empty body
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
    test("should return status code 400 when the request body has incorrect field/s - no fields of this name in runs", () => {
        return request(app)
            .patch("/api/runs/1")
            .send({ name: 'millie'})
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
    test("should return status code 400 when the date field is in an incorrect format", () => {
        const updateBody = { date: "01-09-2024" };
        return request(app)
            .patch("/api/runs/1")
            .send(updateBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: Invalid date format");
            });
    });
});

describe("PATCH /api/users/:user_id", () => {
    test("should return status code 200 and update the user details", () => {
        const updateBody = { gender: "male", single_open: false };
        return request(app)
            .patch("/api/users/1") 
            .send(updateBody)
            .expect(200)
            .then(({ body }) => {
                expect(body.user).toHaveProperty("user_id");
                expect(body.user.gender).toEqual("male");
                expect(body.user.single_open).toEqual(false);
            });
    });
    test("should return status code 400 when the user_id is invalid", () => {
        const updateBody = { single_open: false };
        return request(app)
            .patch("/api/users/invalid_id")
            .send(updateBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request");
            });
    });
    test("should return status code 404 for a user_id that doesn't exist", () => {
        const updateBody = { single_open: false };
        return request(app)
            .patch("/api/users/9999") 
            .send(updateBody)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("User not found!");
            });
    });
    test("should return status code 400 when the request body is missing required fields", () => {
        return request(app)
            .patch("/api/users/1")
            .send({}) // Send an empty body
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
    test("should return status code 400 when the request body has incorrect field/s - no fields of this name in users", () => {
        return request(app)
            .patch("/api/users/1")
            .send({ name: 'millie'})
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
});

describe("PATCH /api/groups/:group_id", () => {
    test("should return status code 200 and update the group details", () => {
        const updateBody = { group_name: "Updated name", description: "updated description" };
        return request(app)
            .patch("/api/groups/1") 
            .send(updateBody)
            .expect(200)
            .then(({ body }) => {
                expect(body.group).toHaveProperty("group_id");
                expect(body.group.group_name).toEqual("Updated name");
                expect(body.group.description).toEqual("updated description");
            });
    });
    test("should return status code 400 when the group_id is invalid", () => {
        const updateBody = { group_name: "Updated name" };
        return request(app)
            .patch("/api/groups/invalid_id")
            .send(updateBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request");
            });
    });
    test("should return status code 404 for a group_id that doesn't exist", () => {
        const updateBody = { group_name: "Updated name" };
        return request(app)
            .patch("/api/groups/9999") 
            .send(updateBody)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("Group not found!");
            });
    });
    test("should return status code 400 when the request body is missing required fields", () => {
        return request(app)
            .patch("/api/groups/1")
            .send({}) // Send an empty body
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
    test("should return status code 400 when the request body has incorrect field/s - no fields of this name in groups", () => {
        return request(app)
            .patch("/api/groups/1")
            .send({ name: 'millie'})
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
});

describe('DELETE /api/groups/:group_id', () => {
    test('should return a 204 status code and no content - specified group_id should be deleted from groups collection', async () => {
        // Create a group for testing
        const group = new GroupModel({ group_id: 7, group_name: 'Test Group', description: 'test group' });
        await group.save();

        return request(app)
            .delete('/api/groups/7')
            .expect(200)
            .then(async () => {
                const foundGroup = await GroupModel.findOne({ group_id: 7 });
                expect(foundGroup).toBeNull();
            });
    });
    test('should return a 404 if given a group_id that does not exist', async () => {
        return request(app)
            .delete('/api/groups/999')
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('Group not found!');
            });
    });
    test('should return a 400 if given an invalid group_id', async () => {
        return request(app)
            .delete('/api/groups/notAnID')
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('DELETE /api/users/:user_id', () => {
    test('should return a 204 status code and no content - specified user_id should be deleted from users collection', async () => {
        // Create a user for testing
        const newUser = {
            user_id: 7,
            username: "newuserTest",
            first_name: "Dave",
            second_name: "Lee",
            gender: "male",
            single_open: true,
            connect_open: false,
            open_to_gender: "male",
            picture_url: "exampleimageurl1"
        };
        const user = new UserModel(newUser);
        await user.save();

        return request(app)
            .delete('/api/users/7')
            .expect(200)
            .then(async () => {
                const foundUser = await UserModel.findOne({ user_id: 7 });
                expect(foundUser).toBeNull();
            });
    });
    test('should return a 404 if given a user_id that does not exist', async () => {
        return request(app)
            .delete('/api/users/999')
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('User not found!');
            });
    });
    test('should return a 400 if given an invalid user_id', async () => {
        return request(app)
            .delete('/api/users/notAnID')
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('DELETE /api/runs/:run_id', () => {
    test('should return a 204 status code and no content - specified run_id should be deleted from runs collection', async () => {
        // Create a run for testing
        const newRun = {
            run_id: 5,
            group_id: 3,
            date: new Date('2024-10-01'), 
            time: "07:45", 
            meeting_point: 'Central Plaza Entrance',
            distance: 5,
            distance_unit: "km",
            location: [53.474524, -2.242604],
            route_id: 2,
        };
        const run = new RunModel(newRun);
        await run.save();

        return request(app)
            .delete('/api/runs/5')
            .expect(200)
            .then(async () => {
                const foundRun = await RunModel.findOne({ run_id: 5 });
                expect(foundRun).toBeNull();
            });
    });
    test('should return a 404 if given a run_id that does not exist', async () => {
        return request(app)
            .delete('/api/runs/999')
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('Run not found!');
            });
    });
    test('should return a 400 if given an invalid run_id', async () => {
        return request(app)
            .delete('/api/runs/notAnID')
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetChatsForUser GET /api/chats/:user_id', () => {
    test('returns a 200 status code for a valid user', () => {
        return request(app).get("/api/chats/1").expect(200);
    });
    test('returns the correct number of chats for user_id 1', () => {
        return request(app)
            .get("/api/chats/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.chats.length).toBe(1);
            });
    });
    test('returns chats for a specified user with the following properties', () => {
        return request(app).get("/api/chats/1").expect(200).then(({ body }) => {
            expect(body.chats[0]).toHaveProperty("chat_id", expect.any(Number));
            expect(body.chats[0]).toHaveProperty("is_group", expect.any(Boolean));
            expect(body.chats[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.chats[0]).toHaveProperty("created_at", expect.any(String));
            expect(body.chats[0]).toHaveProperty("users", expect.any(Array));
        });
    });
    test('returns users for each chat that is returned for a specified user', () => {
        return request(app).get("/api/chats/1").expect(200).then(({ body }) => {
            expect(body.chats[0].users[0]).toHaveProperty("username", expect.any(String));
            expect(body.chats[0].users[0]).toHaveProperty("first_name", expect.any(String));
        });
    });
    test('returns a chat with the correct properties for user_id 1', () => {
        return request(app)
            .get("/api/chats/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.chats[0]).toMatchObject(expect.objectContaining({
                    chat_id: 1,
                    is_group: true,
                    group_id: 1,
                    created_at: expect.any(String),
                    users: [ { username: 'user2', first_name: 'Bob' } ]
                }));
            });
    });
    test('returns a status code of 404 Not Found for a user_id that has no chats', () => {
        return request(app)
            .get("/api/chats/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No chats found for this user!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid user_id format', () => {
        return request(app)
            .get("/api/chats/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetMessagesForChat GET /messages/:chat_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/messages/1").expect(200);
    });
    test('returns the correct number of messages for chat_id 1', () => {
        return request(app)
            .get("/api/messages/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.messages.length).toBe(2);
            });
    });
    test('returns a chat with the correct properties', () => {
        return request(app).get("/api/messages/1").expect(200).then(({ body }) => {
            expect(body.messages[0]).toHaveProperty("message_id", expect.any(Number));
            expect(body.messages[0]).toHaveProperty("chat_id", expect.any(Number));
            expect(body.messages[0]).toHaveProperty("sender_id", expect.any(Number));
            expect(body.messages[0]).toHaveProperty("content", expect.any(String));
            expect(body.messages[0]).toHaveProperty("timestamp", expect.any(String));
        });
    });
    test('returns a message with the correct properties for a specific chat_id', () => {
        return request(app)
            .get("/api/messages/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.messages[0]).toMatchObject(expect.objectContaining({
                    message_id: 1,
                    sender_id: 1,
                    chat_id: 1,
                    content: "Hello, everyone!",
                    timestamp: expect.any(String)
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

describe('POST /api/messages', () => {
    test('should return 201 status code and return the new posted message', () => {
        const newMessage = {
            sender_id: 1,
            chat_id: 1,
            content: "Test message!"
        };
        return request(app)
            .post('/api/messages')
            .send(newMessage)
            .expect(201)
            .then((res) => {
                expect(res.body.message).toMatchObject({
                    message_id: 4,
                    sender_id: 1,
                    chat_id: 1,
                    content: "Test message!",
                    timestamp: expect.any(String)
                });
            });
    });
    test('should return 201 status code and return the new posted message when passed a request with an extra field', () => {
        const newMessage = {
            sender_id: 1,
            chat_id: 1,
            content: "Test message 2!",
            extra_field: 'extra field'
        };
        return request(app)
            .post('/api/messages')
            .send(newMessage)
            .expect(201)
            .then((res) => {
                expect(res.body.message).toMatchObject({
                    message_id: 4,
                    sender_id: 1,
                    chat_id: 1,
                    content: "Test message 2!",
                    timestamp: expect.any(String)
                });
            });
    });
    test('should return 400 Bad Request if the message data is invalid', () => {
        const invalidMessage = {
            sendr_id: 1,
            chat_id: 1,
            content: "Test message 3!",
        };
        return request(app)
            .post('/api/messages')
            .send(invalidMessage)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
    test('should return a 400 Bad Request if the object passed is missing required properties - missing key sender_id', () => {
        const invalidMessage = {
            chat_id: 1,
            content: "Test message 3!",
        };
        return request(app)
            .post('/api/messages')
            .send(invalidMessage)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
});

describe("PATCH /api/messages/:message_id", () => {
    test("should return status code 200 and update the message details", () => {
        const updateBody = { content: "updated content"};
        return request(app)
            .patch("/api/messages/1") 
            .send(updateBody)
            .expect(200)
            .then(({ body }) => {
                expect(body.message).toHaveProperty("message_id");
                expect(body.message.content).toEqual("updated content");
            });
    });
    test("should return status code 400 when the message_id is invalid", () => {
        const updateBody = { content: "updated content" };
        return request(app)
            .patch("/api/messages/invalid_id")
            .send(updateBody)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request");
            });
    });
    test("should return status code 404 for a message_id that doesn't exist", () => {
        const updateBody = { content: "updated content" };
        return request(app)
            .patch("/api/messages/9999") 
            .send(updateBody)
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe("Message not found!");
            });
    });
    test("should return status code 400 when the request body is missing required fields", () => {
        return request(app)
            .patch("/api/messages/1")
            .send({}) // Send an empty body
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
    test("should return status code 400 when the request body has incorrect field/s - no fields of this name in messages", () => {
        return request(app)
            .patch("/api/messages/1")
            .send({ name: 'millie'})
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe("Bad Request: No information was changed");
            });
    });
});

describe('DELETE /api/messages/:message_id', () => {
    test('should return a 204 status code and no content - specified message_id should be deleted from messages collection', async () => {
        // Create a message for testing
        const message = new MessagesModel({ message_id: 4, chat_id: 1, sender_id: 2, content: 'test message', timestamp: "2024-08-01T00:01:00.000Z" });
        await message.save();

        return request(app)
            .delete('/api/messages/4')
            .expect(200)
            .then(async () => {
                const foundMessage = await MessagesModel.findOne({ message_id: 4 });
                expect(foundMessage).toBeNull();
            });
    });
    test('should return a 404 if given a message_id that does not exist', async () => {
        return request(app)
            .delete('/api/messages/999')
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('Message not found!');
            });
    });
    test('should return a 400 if given an invalid message_id', async () => {
        return request(app)
            .delete('/api/messages/notAnID')
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetPostsForUserGroups GET /posts/groups/:user_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/posts/groups/1").expect(200)
    }); 
    test('returns the correct number of posts for user_id 1', () => {
        return request(app)
            .get("/api/posts/groups/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.posts.length).toBe(3);
            });
    });
    test('returns a post for user with the following properties', () => {
        return request(app).get("/api/posts/groups/2").expect(200).then(({body}) => {
            expect(body.posts[0]).toHaveProperty("post_id", expect.any(Number));
            expect(body.posts[0]).toHaveProperty("user_id", expect.any(Number));
            expect(body.posts[0]).toHaveProperty("username", expect.any(String));
            expect(body.posts[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.posts[0]).toHaveProperty("group_name", expect.any(String));
            expect(body.posts[0]).toHaveProperty("run_id", expect.any(Number));
            expect(body.posts[0]).toHaveProperty("is_group", expect.any(Boolean));
            expect(body.posts[0]).toHaveProperty("title", expect.any(String));
            expect(body.posts[0]).toHaveProperty("description", expect.any(String));
            expect(body.posts[0]).toHaveProperty("created_at", expect.any(String));
            expect(body.posts[0]).toHaveProperty("picture_url", expect.any(String));
            expect(body.posts[0]).toHaveProperty("user_url", expect.any(String));
            })
        });
    test('returns a post with the correct properties for user_id 2', () => {
        return request(app)
            .get("/api/posts/groups/2")
            .expect(200)
            .then(({ body }) => {
                expect(body.posts[0]).toEqual(expect.objectContaining({
                    post_id: 4,
                    is_group: true,
                    group_id: 6,
                    group_name: "test6",
                    run_id: 4,
                    user_id: 4,
                    username: "user4",
                    title: "Morning Run Highlights",
                    description: "Fantastic morning run today. Enjoyed every bit of it!",
                    picture_url: "https://images.unsplash.com/photo-1543051932-6ef9fecfbc80?q=80&w=1448&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    user_url: "exampleimageurl4",
                    created_at: expect.any(String)
                }));
            });
    });
    test('returns a status code of 404 Not Found for a user_id that has no group posts', () => {
        return request(app)
            .get("/api/posts/groups/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No posts found for the given user.');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid user_id format', () => {
        return request(app)
            .get("/api/posts/groups/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('GetPicturesByGroup GET /pictures/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/pictures/1").expect(200)
    }); 
    test('returns the correct number of pictures for group_id 1', () => {
        return request(app)
            .get("/api/pictures/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.pictures.length).toBe(2);
            });
    });
    test('returns pictures for a specified group with the following properties', () => {
        return request(app).get("/api/pictures/1").expect(200).then(({body}) => {
            expect(body.pictures[0]).toHaveProperty("picture_id", expect.any(Number));
            expect(body.pictures[0]).toHaveProperty("user_id", expect.any(Number));
            expect(body.pictures[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.pictures[0]).toHaveProperty("url", expect.any(String));
            expect(body.pictures[0]).toHaveProperty("description", expect.any(String));
            })
        });
    test('returns a picture with the correct properties for group_id 3', () => {
        return request(app)
            .get("/api/pictures/3")
            .expect(200)
            .then(({ body }) => {
                expect(body.pictures[0]).toEqual(expect.objectContaining({
                    picture_id: 4,
                    user_id: 4,
                    group_id: 3,
                    url: "http://example.com/images/run4.jpg",
                    description: "Morning run highlights",
                }));
            });
    });
    test('returns a status code of 404 Not Found for a group_id that has no pictures', () => {
        return request(app)
            .get("/api/pictures/99")
            .expect(404)
            .then(({ body }) => {
                expect(body.message).toBe('No pictures found for this group!');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid group_id format', () => {
        return request(app)
            .get("/api/pictures/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('POST /api/posts', () => {
    test('should return 201 status code and return the new posted post', () => {
        const newPost = {
            is_group: true,
            group_id: 6,
            group_name: "test6",
            run_id: 4,
            user_id: 2,
            username: "user2",
            title: "Test Post",
            description: "Testing a post",
            picture_url: "testurl",
        };
        return request(app)
            .post('/api/posts')
            .send(newPost)
            .expect(201)
            .then((res) => {
                expect(res.body.post).toMatchObject({
                    post_id: 5,
                    is_group: true,
                    group_id: 6,
                    group_name: "test6",
                    run_id: 4,
                    user_id: 2,
                    username: "user2",
                    title: "Test Post",
                    description: "Testing a post",
                    picture_url: "testurl",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 201 status code and return the new posted post when passed a request with an extra field', () => {
        const newPost = {
            is_group: true,
            group_id: 6,
            group_name: "test6",
            run_id: 4,
            user_id: 2,
            username: "user2",
            title: "Test Post",
            description: "Testing a post",
            picture_url: "testurl",
            smells_like: 'roses'
        };
        return request(app)
            .post('/api/posts')
            .send(newPost)
            .expect(201)
            .then((res) => {
                expect(res.body.post).toMatchObject({
                    post_id: 5,
                    is_group: true,
                    group_id: 6,
                    group_name: "test6",
                    run_id: 4,
                    user_id: 2,
                    username: "user2",
                    title: "Test Post",
                    description: "Testing a post",
                    picture_url: "testurl",
                    created_at: expect.any(String),
                });
            });
    });
    test('should return 400 Bad Request if the post data is invalid', () => {
        const invalidPost = {
            is_group: true,
            grp_id: 6,
            run_id: 4,
            user_id: 2,
            title: "Test Post 2",
            description: "Testing a post",
            picture_id: 4,
            smells_like: 'roses'
        };
        return request(app)
            .post('/api/posts')
            .send(invalidPost)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
    test('should return a 400 Bad Request if the object passed is missing required properties - missing group_id', () => {
        const invalidPost = {
            is_group: true,
            run_id: 4,
            user_id: 2,
            title: "Test Post 2",
            description: "Testing a post",
            picture_id: 4,
            smells_like: 'roses'
        };
        return request(app)
            .post('/api/posts')
            .send(invalidPost)
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad request');
            });
    });
});

describe('GetUpcomingRunForGroup GET /runs/upcoming/:group_id', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/runs/upcoming/1").expect(200)
    }); 
    test('returns the correct upcoming run date for group_id 5', () => {
        return request(app).get("/api/runs/upcoming/5").expect(200).then(({body}) => {
            expect(body.upcomingRun).toBe("August 3, 2025");
            })
        });
    test('returns No upcoming runs yet for a group that has no upcoming runs', () => {
        return request(app)
            .get("/api/runs/upcoming/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.upcomingRun).toBe('No upcoming runs yet');
            });
    });
    test('returns a status code of 400 Bad Request for an invalid group_id format', () => {
        return request(app)
            .get("/api/runs/upcoming/invalid_group_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});

describe('getGroupsNotInUserGroups GET /groups/usernotin/1', () => {
    test('returns a 200 status code', () => {
        return request(app).get("/api/groups/usernotin/1").expect(200)
    }); 
    test('returns a group by the id with the following properties', () => {
        return request(app).get("/api/groups/usernotin/2").expect(200).then(({body}) => {
            expect(body.groups[0]).toHaveProperty("group_id", expect.any(Number));
            expect(body.groups[0]).toHaveProperty("group_name", expect.any(String));
            expect(body.groups[0]).toHaveProperty("description", expect.any(String));
            expect(body.groups[0]).toHaveProperty("location", expect.any(Array));
            expect(body.groups[0]).toHaveProperty("picture_url", expect.any(String));
            })
        });
    test('returns the correct number of groups for user_id 1', () => {
        return request(app)
            .get("/api/groups/usernotin/1")
            .expect(200)
            .then(({ body }) => {
                expect(body.groups.length).toBe(4);
            });
    });
    test('response for user_id 1 does not include group 1 or group 2', async () => {
        const response = await request(app)
            .get("/api/groups/usernotin/1")
            .expect(200);

        const groups = response.body.groups;
        const groupIds = groups.map(group => group.group_id);

        // Check that the response does not include group_id 1 or 2
        expect(groupIds).not.toContain(1);
        expect(groupIds).not.toContain(2);
    });
    test('returns a status code of 400 Bad Request for an invalid user_id format', () => {
        return request(app)
            .get("/api/groups/usernotin/invalid_user_id")
            .expect(400)
            .then(({ body }) => {
                expect(body.message).toBe('Bad Request');
            });
    });
});
