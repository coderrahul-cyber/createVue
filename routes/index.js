const express = require('express');
// const path = require('path')
const router = express.Router();
const userModel = require('../model/user.model');
const postModel = require('../model/post.model');
const profileroute = require('./profile');
const feedroute = require('./feed');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

passport.use(new localStrategy(userModel.authenticate()));

function islogged(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect('/login');
}
router.use('/profile' ,islogged ,profileroute);

router.use('/feed', feedroute);

router.get('/', (req, res) => {
  res.render("register", { error: req.flash("error") });
});



router.post('/register', async (req, res) => {
  const { fullname, username, email, password } = req.body;

  
  const user = new userModel({ fullname, username, email });
  
  const doesEmailExist = await userModel.findOne({ email });
    if (doesEmailExist) {
     req.flash('error', "email already exists");
      return res.redirect('/')
     }

  userModel.register(user, password, (err) => {
    if (err) {
      req.flash('error', "username is already exists");
      return res.redirect('/');
    }
    passport.authenticate("local", {
      successRedirect: "/profile",
      failureRedirect: '/',
      failureFlash: true
    })(req, res);
  });
});

router.get('/profile', (req, res) => {
  res.render("profile");
});

router.get('/login', (req, res) => {
  res.render("login" , {error : req.flash("error")});
});


router.post('/login', (req, res , next)=>{
  passport.authenticate('local' , (err,user,info)=>{
    if(err){
      console.log("error in register");
      req.flash('error', 'An error occur during login');
      return res.redirect('/login');
    }
    if(!user){
      req.flash('error', 'Incorrect username or password');
      return res.redirect('/login');
    }
    req.logIn(user , (err)=>{
      if(err){
        console.error('Error during login:', err);
        req.flash('error', 'An error occurred during login');
        return res.redirect('/login');
      }
      return res.redirect('/profile');
    });
  })(req,res,next);
});






router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login'); // Redirecting to the home page after logout
  });
});






module.exports = router;
