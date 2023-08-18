const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const path = require("path");
const methodOverride = require("method-override");
const port = process.env.port || 8000;

const app = express();

const database = require("./fake-db");

app.use(methodOverride("_method"));
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

const passport = require("./middleware/passport");
const authRoute = require("./routes/authRoute");

// posts
const postRoute = require("./routes/postRoute");
const { ensureAuthenticated } = require("./middleware/checkAuth");

// middleware for express
app.use(express.json());
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`User details are: `);
  console.log(req.user);

  console.log("Entire session object:");
  console.log(req.session);

  console.log(`Session details are: `);
  console.log(req.session.passport);
  next();
});

// homepage

app.get("/", (req, res) => {
  const authenticated = req.isAuthenticated();
  const posts = database.getPosts(20);
  const users = database.getUsers();

  var user_id = 000;

  if (authenticated) {
    var user_id = req.user.id;
  }
  res.render("posts/posts", { posts, users, authenticated, user_id }); // pass posts and users to the render method
});

app.use("/", postRoute);

// page routes

// posts

// gets all posts
app.get("/posts", (req, res) => {
  const authenticated = req.isAuthenticated();
  const posts = database.getPosts(20);
  const users = database.getUsers();

  let user_id = null;

  if (authenticated) {
    user_id = req.user.id;
  }
  res.render("posts/posts", { posts, users, authenticated, user_id }); // pass posts and users to the render method
});

// gets an individual post
app.get("/posts/show/:postid", (req, res) => {

  const authenticated = req.isAuthenticated();
  const post_id = req.params.postid;
  const post = database.getPost(post_id);

  // total votes to show on post
  const votes = post.votes.reduce((total, vote) => total + vote.value, 0);

  let user_id = null;

  if (authenticated) {
    user_id = req.user.id;
  }

  res.render("posts/post", { post, authenticated, postid: post_id, user_id, votes });
});

// subs

// gets a list of subs
app.get("/subs/list", (req, res) => {
  res.render("subs/list", { database });
});

app.get("/subs/show/:sub", (req, res) => {

  const sub = req.params.sub;
  const posts = database.getPosts(20, sub);
  const users = database.getUsers();
  res.render("posts/posts", { sub, posts, users });
});

app.use("/auth", authRoute);

// define a route for the "/logout" URL
app.get('/logout', (req, res) => {
  // clear the session data
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    } else {
      // redirect the user to a login page
      res.redirect('/auth/login');
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server has started on port ${port}`);
});