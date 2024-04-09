const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const userModel = require('../model/user.model');
const postModel = require('../model/post.model');


router.get('/', async (req, res) => {
    try {
        const posts = await postModel.find({}).populate('userID' , 'username');
        res.render('feed', { posts: posts});
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).send("Internal Server Error");
    }
});




module.exports = router ;