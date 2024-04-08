const mongoose = require('mongoose');
const plm =require('passport-local-mongoose');


mongoose.connect('mongodb://localhost:27017/MediaDownloader');

const userSchema = mongoose.Schema({
    username:{
        type:String,
    },
    fullname:{
        type:String
    },
    email:{
        type:String,

    },
    password:{
        type:String
    },
    bio:{
        type:String,
        def:''
    },
    dp:{
        type:String,
        default:''
    },
    postId:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'posts'
    }]
});

userSchema.plugin(plm);



module.exports = mongoose.model('user' , userSchema);