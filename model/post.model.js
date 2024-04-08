const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/MediaDownloader");

const postSchema = new mongoose.Schema({
    tittle :{
        type : String,
        def : ''
    },
    description:{
        type:String,
        def : ''
    },
    date:{
        type:Date,
        default:Date.now
    },
    userID:{
        type : mongoose.Schema.ObjectId,
        ref:'user'
    },
    image:String
})

module.exports = mongoose.model("posts" , postSchema);