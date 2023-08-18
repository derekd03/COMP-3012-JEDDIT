const express = require("express");
const passport = require("../middleware/passport");
const database = require("../fake-db");
const { ensureAuthenticated } = require("../middleware/checkAuth");
const router = express.Router();

router.get("/create", ensureAuthenticated, (req, res) => {
  res.render("posts/createPost", {
    user: req.user,
  });
});

router.post("/create", ensureAuthenticated, (req, res) => {
  const { title, link, description, subgroup } = req.body;
  const creator = req.user.id.toString();
  const newPost = database.addPost(title, link, creator, description, subgroup);
  // redirects the user to the individual post they created
  res.redirect(`/posts/show/${newPost.id}`);
});

// posts a comment to the database
router.post("/posts/:postid/comments", (req, res) => {

  const post_id = req.params.postid;
  const creator = req.user.id.toString();
  const description = req.body.description;

  database.addComment(post_id, creator, description);

  res.redirect(`/posts/show/${post_id}`);
});

// show an individual comment
router.get('/posts/show/:postid/comments/show/:commentid', function (req, res) {

  const authenticated = req.isAuthenticated();

  let user_id = null;

  if (authenticated) {
    user_id = req.user.id;
  }

  const comment_id = parseInt(req.params.commentid);
  const comment = database.getComment(comment_id);
  const commentCreator = database.getUser(comment.creator);

  const post_id = req.params.postid;
  const post = database.getPost(post_id)

  res.render("posts/comment", { comment, commentCreator, post, user_id });
});

// show the edit post form
router.get("/posts/edit/:postid", (req, res) => {

  const post_id = req.params.postid;
  const post = database.getPost(post_id);

  // check if post is found
  if (!post) {
    res.sendStatus(404);
    return;
  }

  // check if user is the creator of the post
  if (post.creator.id != req.user.id) {
    res.sendStatus(401);
    return;
  }

  res.render("posts/editPost", {
    user: req.user,
    post_id,
  });
});


// handle the edit post request
router.post("/posts/edit/:postid", (req, res) => {

  const post_id = req.params.postid;
  const post = database.getPost(post_id);

  // check if post is found
  if (!post) {
    res.sendStatus(404);
    return;
  }

  // check if user is the creator of the post
  if (post.creator.id != req.user.id) {
    res.sendStatus(401);
    return;
  }

  const subgroup = post.subgroup;

  const { title, link, description } = req.body;
  database.editPost(post_id, { title, link, description, subgroup });

  res.redirect(`/posts/show/${post_id}`);
});


// handle the delete post request
router.get("/posts/deleteconfirm/:postid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const post = database.getPost(post_id);

  if (post.creator.id != req.user.id) {
    res.sendStatus(401);
    return;
  }

  res.render("posts/deletePost", {
    post,
  });
});

// delete post
router.post("/posts/delete/:postid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const post = database.getPost(post_id);

  if (post.creator.id != req.user.id) {
    res.sendStatus(401);
    return;
  }

  database.deletePost(post_id);

  res.redirect("/posts");
});

// handle deletion of comments
router.get("/posts/show/:postid/comments/deleteconfirm/:commentid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const comment_id = req.params.commentid;

  const post = database.getPost(post_id);
  const comment = database.getComment(comment_id);

  // if the user is neither the post creator nor comment creator
  if (post.creator.id != req.user.id && comment.creator != req.user.id) {
    res.sendStatus(401);
    return;
  }

  res.render("posts/deleteComment", {
    post,
    comment
  });
});

// delete comment
router.post("/posts/show/:postid/comments/delete/:commentid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const comment_id = req.params.commentid;

  const post = database.getPost(post_id);
  const comment = database.getComment(comment_id);

  // if the user is neither the post creator nor comment creator
  if (post.creator.id != req.user.id && comment.creator != req.user.id) {
    res.sendStatus(401);
    return;
  }

  database.deleteComment(comment_id);

  res.redirect(`/posts/show/${post_id}`);
});

module.exports = router;

// handle upvoting a post
router.post("/posts/vote/:postid", ensureAuthenticated, (req, res) => {

  const post_id = parseInt(req.params.postid);
  const voteValue = parseInt(req.body.value);

  // find the post in the fake-db.js
  const post = database.getPost(post_id);

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  // check if the user has already voted on this post
  const userVote = database.getVotesForPost(post_id, req.user.id)[0];

  if (userVote) {
    // update the existing vote
    userVote.value = voteValue;
  } else {
    // add a new vote
    database.addVoteForPost(post_id, req.user.id, voteValue);
  }

  // calculate the total number of votes
  const votes = post.votes.reduce((total, vote) => total + vote.value, 0);

  // redirect back to the post page
  res.redirect(`/posts/show/${post_id}?votes=${votes}`);
});

// handle editting of comments
router.get("/posts/show/:postid/comments/editconfirm/:commentid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const comment_id = req.params.commentid;

  const post = database.getPost(post_id);
  const comment = database.getComment(comment_id);

  // if the user is neither the post creator nor comment creator
  if (post.creator.id != req.user.id && comment.creator != req.user.id) {
    res.sendStatus(401);
    return;
  }

  res.render("posts/editComment", {
    post,
    comment
  });
});

// edit comment
router.post("/posts/show/:postid/comments/edit/:commentid", ensureAuthenticated, (req, res) => {

  const post_id = req.params.postid;
  const comment_id = req.params.commentid;

  const post = database.getPost(post_id);
  const comment = database.getComment(comment_id);
  const description = req.body.description;

  // if the user is neither the post creator nor comment creator
  if (post.creator.id != req.user.id && comment.creator != req.user.id) {
    res.sendStatus(401);
    return;
  }

  database.editComment(comment_id, description);

  res.redirect(`/posts/show/${post_id}`);
});

module.exports = router;
