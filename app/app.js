const express = require("express")
const cors = require('cors');

const { handleMongoErrors, handleErrors } = require("./error-handler");

const app = express()
// Use CORS middleware
app.use(cors({
    origin: '*', // Allow all origins - for now, change to front end domain upon production
    methods: ['GET', 'POST', 'DELETE', 'PATCH']
  }));

app.use(express.json())

const apiRouter = require('./routes/api-router');

app.use('/api', apiRouter)

app.all("/*", (req, res) => {
    res.status(404).send({ message: "Not found" });
});

app.use(handleErrors)
app.use(handleMongoErrors)



module.exports = app;

