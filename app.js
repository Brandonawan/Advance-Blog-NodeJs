const ngrok = require('ngrok');
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const moongose = require('mongoose');
const moment = require('moment');
// const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');
// const md5 = require('md5');
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express();
const port = process.env.PORT || 3000;

const saltRounds = 10;

// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Set EJS as templating engine
app.set('view engine', 'ejs'); 


moongose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// const postSchema = new moongose.Schema({
//   title: {
//     type: String,
//     required: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// const userSchema = new moongose.Schema({
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   }
// });

const userSchema = new moongose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }
});


// Encrypt userSchema
// var secret = process.env.secret;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const Post = moongose.model("Post", postSchema);
const User = moongose.model("User", userSchema);

// passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.get('/', async (req, res) => {
  try {
    const posts = await Post.find({});
    return res.render('home', {StartingContent: homeStartingContent, posts: posts});
  } catch (err) {
    console.error(err);
    return res.render('error', {message: 'An error occurred while retrieving posts'});
  }
});

app.post("/compose", async (req, res) => {
  try {
    await Post.insertMany([{ title: req.body.title, content: req.body.content }]);
    console.log("Post added successfully");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error adding post");
  }
});


app.get("/login", function(req, res){
  
    res.render('login', {message: ''});
});

app.get("/register", function(req, res){
  
  res.render('register');
});


app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save().then((user) => {
      console.log(user);
      res.render('compose');
    }).catch((err) => {
      console.log(err);
      res.status(404).render('error', {status: '404', message: 'An error occurred while registering user' });
      
    });
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      const match = await bcrypt.compare(password, foundUser.password);
      if (match) {
        res.render('compose');
      } else {
        res.send('Invalid username or password');
      }
    } else {
      res.send('Invalid username or password');
      res.render('login', {message: 'Invalid username or password'})
    }
  } catch (err) {
    console.error(err);
    res.status(500).render('error', {status: '505', message: 'An error occurred while logging in' });
  }
});



app.get("/about", function(req, res){

  res.render('about', {aboutContent:aboutContent});
});

app.get("/contact", function(req, res){

  res.render('contact', {contactContent:contactContent});
});

// app.get("/compose", function(req, res){

//   res.render('compose');
// });

    
app.get('/post/:_id', async function(req, res){
  // const requested_post_id = _.lowerCase(req.params.post_id);
    const requested_post_id = req.params._id;
    console.log(requested_post_id);

    try {
        const post = await Post.findOne({ title: requested_post_id });
        if (!post) throw new Error('Post not found');
        res.render('post', { title: post.title, content: post.content });
    } catch (err) {
        console.log(err);
        res.status(404).render('error', {status: '404', message: 'The post you are looking for was not found' });
    }
});

// Delete a post using the post id via the button on the home page
app.post('/delete/:id', async (req, res) => {
  await Post.deleteOne({_id: req.params.id})
  return res.redirect('/')
});

                 // Below are the rest api endpoints targetting all articles...
app.route("/articles")
  .get(async (req, res) => {
    try {
      const posts = await Post.find({ }).exec();
      res.send(posts.reverse());
    } catch (error) {
      console.log(error);
      res.status(500).send("Error retrieving articles");
    }
  })
  .post(async (req, res) => {
    try {
      await Post.insertMany([
        { title: req.body.title, content: req.body.content },
      ]);
      res.send("Post added Successfully")  // Success
    } catch (error) {
      console.log(error)      // Failure  
      res.status(500).send("Error adding post.")
    }
  })
  .delete(async (req, res) => {
    try {
      const result = await Post.deleteMany({});
      res.send("All posts deleted");
    } catch (error) {
      console.log(error);
      res.status(500).send("Error deleting posts");
    }
  })


                // Below are the rest api endpoints targetting a article...
app.route("/articles/:_id")
  .get(async function (req, res) {
    try {
      const requested_post_id = req.params._id;
      const post = await Post.findOne({ title: requested_post_id });
      if (!post) {
        throw new Error('Post not found');
      }
      console.log(post);
      res.send(post);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }) 
  .put(async function (req, res) {
    try {
      const filter = { title: req.params._id };
      const update = { title: req.body.title, content: req.body.content };
      const post = await Post.findOneAndUpdate(filter, update, { new: true });
      if (post) {
        res.send("Updated successfully");
      } else {
        res.status(404).send("Post not found");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send("Internal server error");
    }
  })
  .delete(async function (req, res) {
    try {
      await Post.deleteOne({ title: req.params._id });
      res.send('Post deleted successfully');
    } catch (error) {
      console.log(error);
      res.status(500).send('Failed to delete post');
    }
  });


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

// Start the server
// (async function() {
//   const url = await ngrok.connect(port);
//   console.log(`Server running at ${url}`);
//   app.listen(port);
// })();