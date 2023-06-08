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
var cookieParser = require('cookie-parser')

const app = express();
const port = process.env.PORT || 3000;

const saltRounds = 10;

// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Set EJS as templating engine
app.set('view engine', 'ejs'); 

app.use(express.json());
app.use(cookieParser())
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 6000000 }
}))
// Use the session middleware
// app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))


moongose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true});

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

// Encrypt userSchema
// var secret = process.env.secret;
// userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });

const Post = require("./models/post")
const User = require("./models/user")

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session && req.session.user) {
    // User is authenticated, proceed to the next middleware or route handler
    next();
  } else {
    // User is not authenticated, redirect to login page or send an error response
    res.redirect('/login');
  }
};

app.get('/', requireAuth, async (req, res) => {
  try {
    const posts = await Post.find().populate('author');
    res.render('home', { homeStartingContent: homeStartingContent, posts, user: req.session.user });
  } catch (err) {
    console.error(err);
    return res.render('error', {message: 'An error occurred while retrieving posts'});
  }
});


app.get("/login", function(req, res){
  
    res.render('login', {message: '', user: req.session.user});
});

app.get("/register", function(req, res){

  res.render('register', { user: req.session.user });
});

app.post("/register", function(req, res){

  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username,
      password: hash
    });

    newUser.save().then((user) => {
      console.log(user);
      req.session.user = user; // Store user in session
      // res.render('home', {user: user});
      res.redirect('dashboard', {user: user});
    }).catch((err) => {
      console.log(err);
      res.status(404).render('error', {status: '404', message: 'An error occurred while registering user' });
      
    });
  });
});


app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    console.log(req.session);
    const userId = req.session.user._id;
    const posts = await Post.find({ author: userId }).populate('author');
    res.render('dashboard', { posts, user: req.session.user });
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving user posts');
  }
});

// app.post('/register', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if a user with the same email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.send('User with this email already exists');
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({
//       email,
//       password: hashedPassword
//     });

//     await user.save();

//     req.session.user = user; // Store user in session

//     res.redirect('/dashboard');
//   } catch (error) {
//     console.error(error);
//     res.send('Error registering user');
//   }
// });

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ email: username });
    if (foundUser) {
      const match = await bcrypt.compare(password, foundUser.password);
      if (match) {
        // Set the user in the session.
        req.session.user = foundUser.email;
        console.log(req.session.user);
        // res.redirect('/dashboard' , {user: req.session.user});
        const userId = req.session.user._id;
        const posts = await Post.find({ author: userId }).populate('author');
        res.render('dashboard', { posts, user: req.session.user });
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

app.get('/compose', requireAuth, (req, res) => {
  res.render('compose', { user: req.session.user });
});

// app.post("/compose", async (req, res) => {
// try {
//   const author = req.session.user._id;
//   await Post.insertMany([{ title: req.body.title, content: req.body.content, author }]);
//   console.log("Post added successfully");
//   res.redirect("/");
// } catch (error) {
//   console.log(error);
//   res.status(500).send("Error adding post");
// }
// });

app.post("/compose", async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.redirect('/login');
    }

    const newPost = {
      title: req.body.title,
      content: req.body.content,
      author: currentUser._id
    };

    const post = await Post.create(newPost);

    currentUser.posts.push(post);
    await currentUser.save();

    // return res.redirect(`/posts/${post._id}`);
    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.redirect('/');
  }
});

  
// app.post("/compose", async (req, res) => {
//   try {
//     const author = req.session.user._id;
//     const { title, content } = req.body;

//     const post = new Post({
//       title,
//       content,
//       author
//     });

//     await post.save();
//     console.log("Post added successfully");
//     res.redirect("/");
//   } catch (error) {
//     console.log(error);
//     res.status(500).send("Error adding post");
//   }
// });



app.get("/about", function(req, res){

  res.render('about', {user: req.session.user, aboutContent:aboutContent});
});

app.get("/contact", function(req, res){

  res.render('contact', {user: req.session.user, contactContent:contactContent});
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.clearCookie('connect.sid')
    res.redirect('/');
  });
});

    
app.get('/post/:_id', async function(req, res){
  // const requested_post_id = _.lowerCase(req.params.post_id);
    const postId = req.params.id;
    try {
      const post = await Post.findById(postId).populate('author');
        // if (!post) throw new Error('Post not found');
        res.render('post', { post, user: req.session.user });
    } catch (err) {
        console.log(err);
        res.status(500).render('error', {status: '500', message: 'Error retrieving post' });
    }
});

// update post
app.get("/post/:_id/edit", async (req, res) => {
  try {
    const requested_post_id = req.params._id;
    const post = await Post.findOne({ _id: requested_post_id });
    if (!post) {
      throw new Error("Post not found");
    }
    res.render("edit", { post });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// POST route to handle the update operation
app.post("/post/:_id/edit", async (req, res) => {
  try {
    const filter = { _id: req.params._id };
    const update = { title: req.body.title, content: req.body.content };
    const post = await Post.findOneAndUpdate(filter, update, { new: true });
    if (post) {
      res.redirect("/"); // Redirect to the articles list
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
});

// Delete a post using the post id via the button on the home page
app.post('/delete/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.session.user._id;
    await Post.deleteOne({ _id: postId, author: userId });
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.status(500).send('Error deleting post');
  }
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


                // Below are the rest api endpoints targetting a single article...
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