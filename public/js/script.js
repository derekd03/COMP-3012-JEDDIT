// for displaying relevant options in the navigation bar

// see if the user is logged in or not
fetch('/auth/status')
  .then(response => response.json())
  .then(data => {

    // if the user is logged in or not
    const authenticated = data.authenticated;

    // either displays "log in" or "log out" depending on which is contextually appropriate
    var loggingLink;

    // if the user is logged in
    if (authenticated) {

      // log out html
      loggingLink = '<a href="/auth/logout">Logout</a>';

      // check if current page is not "/create", so that the "create post" button
      // is not unnessarily displayed
      if (!location.href.includes('/create')) {
        const postButton = `<button onclick="window.location.href='/create'">Create Post</button>`;
        document.querySelector('.nav').insertAdjacentHTML('afterbegin', postButton);
      }

      // allow the user to log out
      document.querySelector('.nav').insertAdjacentHTML('beforeend', loggingLink);
    }
    else {
      // log in link
      loggingLink = '<a href="/auth/login">Login</a>';
      // allow the user to log in
      document.querySelector('.nav').insertAdjacentHTML('beforeend', loggingLink);
    }
    const jedditHeader = `<a href="/posts">
<h1>
  JEDDIT
</h1>
</a>`;
    document.querySelector('.nav').insertAdjacentHTML('afterbegin', jedditHeader);
  });

function editPost(postId) {
  fetch(`/posts/edit/${postId}`, {
    method: 'POST',
  });
}

function deletePost(postId) {
  fetch(`/posts/delete/${postId}`, {
    method: 'POST',
  });
}

function validateComment() {
  const commentDescription = document.getElementById("comment-description").value.trim();
  if (!commentDescription) {
    alert("Comment cannot be empty.");
    return false;
  }
  return true;
}
