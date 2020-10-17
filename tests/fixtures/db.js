const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()     //creating dummy ObjectId
//defining dummy user object
const userOne = {
    _id: userOneId,
    name: 'Mike',
    email: 'mike@example.com',
    password: '56what!!',
    tokens: [{
        token: jwt.sign({ _id: userOneId, }, process.env.JWT_SECRET)    //creating token
    }]
}

const userTwoId = new mongoose.Types.ObjectId()     //creating dummy ObjectId
//defining dummy user object
const userTwo = {
    _id: userTwoId,
    name: 'Jess',
    email: 'jess@example.com',
    password: 'myhouSe99!!',
    tokens: [{
        token: jwt.sign({ _id: userTwoId, }, process.env.JWT_SECRET)    //creating token
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: false,
    owner: userTwo._id
}

const setupDatabase = async () => {
    await User.deleteMany()                             //cleanup user collection
    await new User(userOne).save()                     //save dummy users to database
    await new User(userTwo).save()
    await Task.deleteMany()                             //cleanup task collection
    await new Task(taskOne).save()                      //save dummy tasks to database
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}