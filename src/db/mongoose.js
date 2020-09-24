const mongoose = require('mongoose')    //importing mongoose

//connecting to mongodb and creating db
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,    //making sure indexes are created when mongoose is working with mongodb
    useFindAndModify: false
})
