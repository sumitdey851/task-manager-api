const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

//Creating the user schemma from user object
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')){
               throw new Error("Password cannot contain 'password'!")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
}) 










//virtual allows us to setup virtual attributes that are not actually pasrt of db but act as one
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',      //the local field which belongs to the relation
    foreignField: 'owner'        //the field in the the other Schema to which the local field is related to
})      

//instance function to get user's public profile by hiding sensitive content
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    //deleting sensitive and irrelevant data from user response
    delete userObject.password      //remove user password from profile response
    delete userObject.tokens        //remove user tokens from profile response
    delete userObject.avatar        //remove avatar binary data from profile response

    return userObject
}

//instance function to generate auth token
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//define a reusable method to validate user credentials
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if(!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
        
    if(!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//define a pre hook to hash the plain-text password before saving the document
userSchema.pre('save', async function (next) {
    const user = this       //getting the current user for which the function was called

    if(user.isModified('password')) {   //checking if the password property was modified
        user.password = await bcrypt.hash(user.password, 8) //re-hash and update the modofied password
    }

    next()      //execute save operation once validation and encryption is done
})

//delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

//defining User Model passing model name and schema object as arguments
const User = mongoose.model('User', userSchema)

module.exports = User