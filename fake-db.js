
const users = {
  1: {
    id: 1,
    uname: 'alice',
    password: 'alpha',
  },
  2: {
    id: 2,
    uname: 'bob',
    password: 'bravo',
  },
  3: {
    id: 3,
    uname: 'carol',
    password: 'charlie',
  },
  4: {
    id: 4,
    uname: 'dave',
    password: 'delta',
  },
};

const posts = {
  101: {
    id: 101,
    title: "Fishsticks",
    link: "https://www.smithsonianmag.com/innovation/surprising-success-story-fish-sticks-180977578/",
    description: "I actually really do not like fish sticks",
    creator: 1,
    subgroup: 'food',
    timestamp: 1643648446955,
  },
  102: {
    id: 102,
    title: "Charlie the Unicorn",
    link: "https://www.youtube.com/watch?v=CsGYh8AacgY",
    description: "",
    creator: 2,
    subgroup: 'documentaries',
    timestamp: 1642611742010,
  },
};

const comments = {
  9001: {
    id: 9001,
    post_id: 102,
    creator: 1,
    description: "Actually I learned a lot :pepega:",
    timestamp: 1642691742010,
  }
}

const votes = [
  { user_id: 2, post_id: 101, value: +1 },
  { user_id: 3, post_id: 101, value: +1 },
  { user_id: 4, post_id: 101, value: +1 },
  { user_id: 3, post_id: 102, value: -1 },
]

function debug() {
  console.log("==== DB DEBUGING ====")
  console.log("users", users)
  console.log("posts", posts)
  console.log("comments", comments)
  console.log("votes", votes)
  console.log("==== DB DEBUGING ====")
}

function getUser(id) {
  return users[id];
}

function getUserByUsername(uname) {
  return getUser(Object.values(users).filter(user => user.uname === uname)[0].id);
}

function getVotesForPost(post_id) {
  return votes.filter(vote => vote.post_id === post_id);
}

// student-added add vote to post function
function addVoteForPost(post_id, user_id, value) {

  const vote = { user_id, post_id, value };
  votes.push(vote);

  // update the post's votes property in the database
  const post = posts[post_id];
  post.votes = getVotesForPost(post_id);

  return vote;
}


function decoratePost(post) {
  post = {
    ...post,
    creator: users[post.creator],
    votes: getVotesForPost(post.id),
    comments: Object.values(comments).filter(comment => comment.post_id === post.id).map(comment => ({ ...comment, creator: users[comment.creator] })),
  }
  return post;
}

/**
 * @param {*} n how many posts to get, defaults to 5
 * @param {*} sub which sub to fetch, defaults to all subs
 */
function getPosts(n = 5, sub = undefined) {
  let allPosts = Object.values(posts);
  if (sub) {
    allPosts = allPosts.filter(post => post.subgroup === sub);
  }
  allPosts.sort((a, b) => b.timestamp - a.timestamp);
  return allPosts.slice(0, n);
}

function getPost(id) {
  return decoratePost(posts[id]);
}

function addPost(title, link, creator, description, subgroup) {
  let id = Math.max(...Object.keys(posts).map(Number)) + 1;
  let post = {
    id,
    title,
    link,
    description,
    creator: Number(creator),
    subgroup,
    timestamp: Date.now(),
  }
  posts[id] = post;
  return post;
}

function editPost(post_id, changes = {}) {
  let post = posts[post_id];
  if (changes.title) {
    post.title = changes.title;
  }
  if (changes.link) {
    post.link = changes.link;
  }
  if (changes.description) {
    post.description = changes.description;
  }
  if (changes.subgroup) {
    post.subgroup = changes.subgroup;
  }
}

function deletePost(post_id) {
  delete posts[post_id];
}

// student-added getComment function
function getComment(comment_id) {
  return comments[comment_id];
}

// student-added delete comment function
function deleteComment(comment_id) {
  delete comments[comment_id];
}

// student-added edit comment funciton
function editComment(comment_id, description) {
  comments[comment_id].description = description;
}

function getSubs() {
  return Array.from(new Set(Object.values(posts).map(post => post.subgroup)))
}

function addComment(post_id, creator, description) {
  let id = Math.max(...Object.keys(comments).map(Number)) + 1;
  let comment = {
    id,
    post_id: Number(post_id),
    creator: Number(creator),
    description,
    timestamp: Date.now(),
  }
  comments[id] = comment;
  return comment;
}

// student-added getUsers()
function getUsers() {
  return users;
}

module.exports = {
  debug,
  getUser,
  getUserByUsername,
  getVotesForPost,
  getPosts,
  getPost,
  addPost,
  editPost,
  deletePost,
  getSubs,
  addComment,

  // student-added exports
  getUsers,
  getComment,
  editComment,
  deleteComment,
  addVoteForPost
};

