const express = require('express')      //importing express
require('./db/mongoose')        //importing mongodb connection
const userRouter = require('./routers/user')    //importing user routers
const taskRouter = require('./routers/task')    //importing task routers

const app = express()       //creating new app

app.use(express.json())     //automatically parse incoming json into an object
app.use(userRouter)         //use user routers from file
app.use(taskRouter)         //use task routers from file

module.exports = app