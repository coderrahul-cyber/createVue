const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const userModel = require('../model/user.model');
const postModel = require('../model/post.model');


router.get('/', async (req, res) => {
    try {
       // mongoose me aggreate is used for to processes the data records and return computed results . like we have different ,methods in array .
        const randomPosts = await postModel.aggregate([
            // isse me sample use hum kiya kyuki sample is used to take random records from the data base it size as a object (which means that that number records will take randomly from data base)
            { $sample: { size: 24 } }
        ]);
        

        res.render('feed', { posts: randomPosts });
    } catch (error) {
        console.error("Error fetching random posts:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/down/:id" , async (req,res)=>{
    const id = req.params.id ;
    const post = await postModel.findById(id) ;
    if(!post){
        return res.status(404).send("Post does not found");
    }

    const file = path.join(__dirname , "../public/images/uploads/", post.image);
    res.download(file , post.image);

})




module.exports = router ;