const express = require("express")

const { handleMongoErrors, handleErrors } = require("./error-handler");

const app = express()
app.use(express.json())

const apiRouter = require('./routes/api-router');

app.use('/api', apiRouter)

app.all("/*", (req, res) => {
    res.status(404).send({ message: "Not found" });
});

app.use(handleErrors)
app.use(handleMongoErrors)



module.exports = app;

