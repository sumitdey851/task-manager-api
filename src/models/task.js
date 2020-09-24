const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    owner: {                                        //this is an object id field that identifies a user to which a task belongs
        type: mongoose.Schema.Types.ObjectId,       //specifying type ObjectId
        required: true,
        ref: 'User'                                 //Linking task db to user db
    }
}, {
    timestamps: true
})

//creating model Task
const Task = mongoose.model('Task', taskSchema)

module.exports = Task