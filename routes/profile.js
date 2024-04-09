const express = require("express");
const router = express.Router();
const fs = require("fs");
const upload = require("./mullter");
const path = require("path");
const userModel = require("../model/user.model");
const postModel = require("../model/post.model");
const { error } = require("console");

router.get("/", async (req, res) => {
  try {
    const user = await userModel.findOne({
      username: req.session.passport.user,
    });
    const userpostid = await userModel
      .findOne({
        username: req.session.passport.user,
      })
      .populate("postId");
    res.render("profile", { user, userpostid });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Internal Server Error");
  }
});

//or we can use
// const user = await userModel.findOne({
//   $or: [
//     { username: req.session.passport.user },
//     { fullname: req.session.passport.user },

//   ]
// });
// const post =
//  await userModel
// .findOne({
//   username : req.session.passport.user})
// .populate('postId') ;
// res.render('profile' , {user , post });
router.get("/uploads", (req, res) => {
  res.render("upload", { error: req.flash("error") });
});

router.post("/add", upload.single("fileu"), async (req, res) => {
  if (!req.file) {
    req.flash("error", "No file was Selected..");
    return res.redirect("/profile/uploads");
  }

  const user = await userModel.findOne({
    username: req.session.passport.user,
  });

  const post = await postModel.create({
    tittle: req.body.text,
    description: req.body.des,
    userID: user._id,
    image: req.file ? req.file.filename : null,
  });

  user.postId.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get("/edit", async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("edit", { user, error: req.flash("error") });
});

router.post("/infor", async (req, res) => {
  const updateFields = {};
  // we are save if the user want only to change username , bio , fullname
  // Check if username,bio,fullname is provided and not empty
  if (req.body.username && req.body.username.trim() !== "") {
    updateFields.username = req.body.username;
  }
  if (req.body.fullname && req.body.fullname.trim() !== "") {
    updateFields.fullname = req.body.fullname;
  }
  if (req.body.bio && req.body.bio.trim() !== "") {
    updateFields.bio = req.body.bio;
  }

  // yeh line to tab exectue hoge jab username find hoga
  const existingUser = await userModel.findOne({ username: req.body.username });

  // Check if the username exists and belongs to a different user
  if (
    existingUser &&
    existingUser._id.toString() !== req.session.passport.user
  ) {
    req.flash("error", "Username is already in use");
    return res.redirect("/profile/edit");
  }

  // main code for updating the the periviuos detail
  const user = await userModel.findOneAndUpdate(
    { username: req.session.passport.user },
    updateFields,
    { new: true }
  );

  // Login the user again to update the session
  req.login(user, function (err) {
    if (err) {
      console.error("Error logging in user:", err);
      return res.status(500).send("Internal Server Error");
    }
    //console.log(existingUser)
    res.redirect("/profile");
  });
});

router.get("/dpCH", async (req, res) => {
  const user = await userModel.findOne({
    username: req.session.passport.user,
  });
  res.render("dp", { user });
});

router.post("/dpUP", upload.single("dp"), async (req, res) => {
  try {
    // Find the current user
    const currentuser = await userModel.findOne({
      username: req.session.passport.user,
    });

    // If the user is not found, handle the error
    if (!currentuser) {
      return res.redirect("/profile");
    }
    // for accesing old one
    const periviuosDp = currentuser.dp;

    // test
    //  fs.writeFile("currentuser.username , currentuser.dp , ()=>{
    //   console.log("done");
    //  })

    currentuser.dp = req.file.filename;
    await currentuser.save();

    // deleting old one from the folder
    if (periviuosDp) {
      const deleteDP = path.join(__dirname, "../public/images/dp", periviuosDp);
      fs.unlinkSync(deleteDP);
    }
    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.redirect("/profile");
  }
});

router.get("/delete/:id", async (req, res) => {
  const id = req.params.id;
  // deleting the post from profile and from local database
  try {
    const post = await postModel.findById(id);
    if (!post) {
      return res.send("Error : Post does not found");
    }
    const current_pic = post.image;

    const deletePost = await postModel.findByIdAndDelete(id);
    if (!deletePost) {
      return res.send("Error : post does not found");
    }

    // deleting from the user model the id of that post
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("postId");

    if (user) {
      try {
        // Remove the specific element from the postId array using $pull
        await userModel.updateOne({ _id: user._id }, { $pull: { postId: id } });
      } catch (error) {
        console.error("Error removing element:", error);
        res.status(500).send("Error: Unable to remove element");
      }
    } else {
      res.status(404).send("Error: User not found");
    }

    //deleting from the local server
    const L_Server = path.join(
      __dirname,
      "../public/images/uploads",
      current_pic
    );

    fs.unlinkSync(L_Server);

    res.redirect("/profile");
  } catch (err) {
    res.status(500).send("Error : unable to delete the post");
  }
});

module.exports = router;
