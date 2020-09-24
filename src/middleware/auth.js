const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')    //getting bearer token from request header
        const decoded = jwt.verify(token, process.env.JWT_SECRET)              //verifying and decoding token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })    //finding user by id and checking if token exists

        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch(e) {
        res.status(401).send({ error: "Please authenticate." })
    }
}

module.exports = auth