const express = require('express')  
const multer = require('multer')            //importing file-upload npm
const sharp = require('sharp')
const User = require('../models/user')      //importing user model
const auth = require('../middleware/auth')  //importing authentication middleware
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

//Using the express.Router class to create modular, mountable route handlers
const router = new express.Router()         //creating a router instance. 



//setting up route to create new user
router.post('/users', async (req, res) => {      
    const user = new User(req.body)     //creating new user using response body

    try{
        await user.save()       //save user and return user on success or error on failure
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()    //generate token for user before saving
        res.status(201).send({ user, token })
    } catch(e) {                //execute catch block if promise is unfulfilled
        res.status(400).send(e)
    }
})


//setting up route for user validation and login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)    //verifying user
        const token = await user.generateAuthToken()    //generate a token
        res.send({ user, token })   //send user and token data to client
    } catch(e) {
        res.status(400).send()
    }
})

//setting up route to logout o current session
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token        //filtering and excluding the current session token
        })
        await req.user.save()       //saving the user state

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

//setting up route to logout of all sessions
router.post('/users/logoutAll', auth, async(req, res) => {
    try {
        req.user.tokens = []    //emptying the tokens array to delete all sessions
        await req.user.save()   //saving the user state

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

//setting up route to fetch all users
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


//setting up route to update user by id
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)       //convert it to a string array
    const allowedUpdates = ['name', 'email', 'password', 'age']     //defining a string array of properties allowed for updates
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send(e)
    }
})

//setting up route to delete a user by id
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch(e) {
        res.status(500).send()
    }
    
})

//setting up multer to store profile pics into an avatars directory
const upload = multer({
    //dest: 'avatars',      //to save to filesystem
    limits: {
        fileSize: 1000000       //size in bytes
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {         //using regex to filter out file extensions
            return cb(new Error('Please upload an image file'))        //throw error if file extension don't match
        }

        cb(undefined, true)             //upload file
    }
})

//setting up router to upload profile picture of user
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //use sharp to resize image and convert to standard png type
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer    //storing modified image to database
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//setting up router to delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

//setting up a router for avatar url
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

module.exports = router