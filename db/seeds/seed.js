const { db } = require('../../connection');
const mongoose = require('mongoose');

// Group Schema and Model
const groupSchema = new mongoose.Schema({
    group_id: { type: Number, required: true, unique: true },
    created_at: { type: Date, default: Date.now },
    group_name: { type: String, required: true}, 
    description: String
}, { versionKey: false });

const GroupModel = mongoose.model("Group", groupSchema);


// User Schema and Model
const userSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, unique: true }, 
    username: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    first_name: { type: String, required: true },
    second_name: { type: String, required: true },
    gender: { type: String, required: true },
    single_open: { type: Boolean, required: true },
    connect_open: { type: Boolean, required: true },
    open_to_gender: { type: String, required: true }
}, { versionKey: false });

const UserModel = mongoose.model("User", userSchema);

// UsersRunningGroups Schema and Model
const usersRunningGroupsSchema = new mongoose.Schema({
  user_id: { type: Number, required: true, ref: 'User' },
  group_id: { type: Number, required: true, ref: 'Group' },
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

const UsersRunningGroupsModel = mongoose.model("UsersRunningGroups", usersRunningGroupsSchema);

// Runs Schema and Model
const runSchema = new mongoose.Schema({
    run_id: { type: Number, required: true, unique: true },
    group_id: { type: Number, required: true, ref: 'Group' },
    date: { type: Date, required: true }, // Only the date part
    time: { type: String, required: true }, // Time part, will be in format "HH:mm"
    meeting_point: { type: String, required: true },
    distance: { type: Number, required: true },
    distance_unit: { type: String, required: true },
    route_id: { type: Number, required: true, ref: 'Route ' },
}, { versionKey: false });

const RunModel = mongoose.model("Run", runSchema);

// Users Attending Runs Schema and Model
const usersAttendingRunsSchema = new mongoose.Schema({
    user_id: { type: Number, required: true, ref: 'User' },
    run_id: { type: Number, required: true, ref: 'Run' },
    status: { type: String, required: true }
}, { versionKey: false });

const UsersAttendingRunsModel = mongoose.model("UsersAttendingRuns", usersAttendingRunsSchema);

// Route Schema and Model
const routeSchema = new mongoose.Schema({
    route_id: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
}, { versionKey: false });

const RouteModel = mongoose.model("Route", routeSchema);

// Route Waypoints Schema and Model
const routeWaypointsTableSchema = new mongoose.Schema({
    waypoint_id: { type: Number, required: true, unique: true },
    route_id: { type: Number, required: true, ref: 'Route' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    sequence: { type: Number, required: true }
}, { versionKey: false });

const RouteWaypointsTableModel = mongoose.model("RouteWaypointsTable", routeWaypointsTableSchema);

// Chats Schema and Model
const ChatsSchema = new mongoose.Schema({
    chat_id: { type: Number, required: true, unique: true },
    is_group: { type: Boolean, required: true },
    group_id: { type: Number, required: true, ref: 'Group' },
    created_at: { type: Date, default: Date.now },
}, { versionKey: false });

const ChatsModel = mongoose.model("Chats", ChatsSchema);

// Chats Participants Schema and Model
const ChatParticipantsSchema = new mongoose.Schema({
    chat_id: { type: Number, required: true, ref: 'Chats' },
    user_id: { type: Number, required: true, ref: 'User' },
}, { versionKey: false });

const ChatParticipantsModel = mongoose.model("ChatParticipants", ChatParticipantsSchema);

// Messages Schema and Model
const MessagesSchema = new mongoose.Schema({
    message_id: { type: Number, required: true, unique: true },
    timestamp: { type: Date, default: Date.now },
    chat_id: { type: Number, required: true, ref: 'Chats' },
    sender_id: { type: Number, required: true, ref: 'User' },
    content: { type: String, required: true },
}, { versionKey: false });

const MessagesModel = mongoose.model("Messages", MessagesSchema);

// Posts Schema and Model
const PostsSchema = new mongoose.Schema({
    post_id: { type: Number, required: true, unique: true },
    is_group: { type: Boolean, required: true },
    user_id: { type: Number, required: true, ref: 'User' },
    group_id: { type: Number, required: true, ref: 'Group' },
    run_id: { type: Number, required: true, ref: 'Run' },
    created_at: { type: Date, default: Date.now },
    title: { type: String, required: true },
    description: { type: String, required: true },
    picture_id: { type: Number, required: false, ref: 'Picture' },
}, { versionKey: false });

const PostsModel = mongoose.model("Post", PostsSchema);

// Pictures Schema and Model
const PicturesSchema = new mongoose.Schema({
    picture_id: { type: Number, required: true, unique: true },
    user_id: { type: Number, required: true, ref: 'User' },
    group_id: { type: Number, required: true, ref: 'Group' },
    post_id: { type: Number, required: true, ref: 'Post' },
    url: { type: String, required: true },
    description: { type: String, required: false },
}, { versionKey: false });

const PicturesModel = mongoose.model("Picture", PicturesSchema);

// seedData function
function seedData({ groupData, userData, usersRunningGroupsData, runData, routeData, usersAttendingRunsData, routeWaypointsData, chatData, chatParticipantData, messagesData, postsData, picturesData }) {
    return Promise.all([
        // Drop the existing collections
        GroupModel.collection.drop(),
        UserModel.collection.drop(),
        UsersRunningGroupsModel.collection.drop(),
        RunModel.collection.drop(),
        RouteModel.collection.drop(),
        UsersAttendingRunsModel.collection.drop(),
        RouteWaypointsTableModel.collection.drop(),
        ChatsModel.collection.drop(),
        ChatParticipantsModel.collection.drop(),
        MessagesModel.collection.drop(),
        PostsModel.collection.drop(),
        PicturesModel.collection.drop()
    ])
    .then(() => {
        const groupsWithIds = groupData.map((group, index) => ({
            ...group,
            group_id: index + 1,
        }));
        const usersWithIds = userData.map((user, index) => ({
            ...user,
            user_id: index + 1,
        }));
        const usersRunningGroupsWithIds = usersRunningGroupsData.map((entry) => ({
          ...entry,
        }));
        const runsWithIds = runData.map((run, index) => ({
            ...run,
            run_id: index + 1,
        }));
        const usersAttendingRunsWithIds = usersAttendingRunsData.map((entry) => ({
            ...entry,
          }));
        const routesWithIds = routeData.map((route, index) => ({
            ...route,
            route_id: index + 1,
        }));
        const routeWaypointsWithIds = routeWaypointsData.map((waypoint, index) => ({
            ...waypoint,
            waypoint_id: index + 1,
        }));

        const chatsWithIds = chatData.map((chat, index) => ({
            ...chat,
            chat_id: index + 1,
        }));
        const chatParticipantsWithIds = chatParticipantData.map((entry) => ({
            ...entry,
          }));
        const messagesWithIds = messagesData.map((message, index) => ({
            ...message,
            message_id: index + 1,
        }));
        const postsWithIds = postsData.map((post, index) => ({
            ...post,
            post_id: index + 1,
        }));
        const picturesWithIds = picturesData.map((picture, index) => ({
            ...picture,
            picture_id: index + 1,
        }));
  
        return Promise.all([
            // Insert the new data
            GroupModel.insertMany(groupsWithIds),
            UserModel.insertMany(usersWithIds),
            UsersRunningGroupsModel.insertMany(usersRunningGroupsWithIds),
            RunModel.insertMany(runsWithIds),
            UsersAttendingRunsModel.insertMany(usersAttendingRunsWithIds),
            RouteModel.insertMany(routesWithIds),
            RouteWaypointsTableModel.insertMany(routeWaypointsWithIds),
            ChatsModel.insertMany(chatsWithIds),
            ChatParticipantsModel.insertMany(chatParticipantsWithIds),
            MessagesModel.insertMany(messagesWithIds),
            PostsModel.insertMany(postsWithIds),
            PicturesModel.insertMany(picturesWithIds)
        ])
        .then(() => console.log('Data seeded successfully'))
        .catch((err) => console.error('Error seeding data:', err));
    })
    .catch((err) => console.error('Error dropping collections:', err));
  }


module.exports = { GroupModel, UserModel, UsersRunningGroupsModel, RunModel, UsersAttendingRunsModel, RouteModel, RouteWaypointsTableModel, ChatsModel, ChatParticipantsModel, MessagesModel, PostsModel, PicturesModel, seedData };
