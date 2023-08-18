const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const database = require("../fake-db");

const localLogin = new LocalStrategy(
  {
    usernameField: "username",
    passwordField: "password",
  },
  (usernameField, password, done) => {
    const user = database.getUserByUsername(usernameField);
    return user
      ? done(null, user)
      : done(null, false, {
        message: "Your login details are not valid. Please try again",
      });
  }
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  let user
    = database.getUser(id);
  if (user) {
    done(null, user);
  } else {
    done({ message: "User not found" }, null);
  }
});

module.exports = passport.use(localLogin);
