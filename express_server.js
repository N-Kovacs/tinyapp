//requires
const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { userNameCheck, generateRandomString, urlsForUser} = require("./helpers");


const app = express();
const PORT = 8080; // default port 8080

app.use(cookieSession({
  name: 'session',
  keys: ["12312312312354"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs");

const urlDatabase = {};
const users = {};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//shows urls of active user, redirects to login page if not logged in
app.get("/urls", (req, res) => {

  if ((req.session.user_id) && (users[req.session.user_id])) {
    let userURL = urlsForUser(req.session.user_id, urlDatabase, users);
    const templateVars = {
      urls: userURL,
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/urls/new");
  }
});

//shows the register page, where new users can be created
app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});


//shows the login page, where existing users can login
app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

//lets logged in users create new urls, redirects to login page if not logged in
app.get("/urls/new", (req, res) => {
  const templateVars = { users: users, user_id: req.session.user_id };
  if (!(req.session.user_id)) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//lets users view their existing links, if accessed while not logged in or as not the owner, instead shows error
app.get("/urls/:id", (req, res) => {
  if ((req.session.user_id) === urlDatabase[req.params.id].userID) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      users: users,
      user_id: req.session.user_id
    };
    res.render("urls_show", templateVars);
  } else if ((req.session.user_id)) {
    res.status(401);
    res.send('401: You do not own this url');
  } else {
    res.status(401);
    res.send('401: Must be logged in');
  }
});

// sends to location of redirect if it exists, otherwise sends error
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    let direct = urlDatabase[req.params.id].longURL;
    res.redirect(direct);
  } else {
    res.status(404);
    res.send('404: Redirect does not exist');
  }
});

//creates new url links, if user is logged in, otherwise sends error
app.post("/urls", (req, res) => {
  if ((req.session.user_id)) {
    let randString = generateRandomString();
    urlDatabase[randString] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect("/urls/" + randString);

  } else {
    res.status(401);
    res.send('401: Must be logged in to post urls');
  }


});

// edits existing url links if user is owns link and is logged in, otherwise sends error

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.send('URL not found');
  } else if ((req.session.user_id) === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls/");
  } else {
    res.status(401);
    res.send('401: You do not own this url to edit');
  }
});

// deletes existing url links if user owns link and is logged in, otherwise sends error
app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.send('URL not found');
  } else if ((req.session.user_id) === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  } else {
    res.status(401);
    res.send('You do not own this url to delete');
  }
});

// logs in with correct username and password
app.post("/login", (req, res) => {
  let passcheck = userNameCheck(req.body.email, users);
  if (passcheck) {
    if (bcrypt.compareSync((req.body.password), passcheck.password)) {
      req.session.user_id =  passcheck.id;
      res.redirect("/urls/");
    } else {
      res.status(403);
      res.send('403: Log in failed');
    }
  } else {
    res.status(403);
    res.send('403: Log in failed');
  }

});


// deletes user cookie to log out
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls/");
});


//creates a new user, assuming new email, and no blank entries
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  if ((userNameCheck(req.body.email, users)) || req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('400: Error creating email, please try again');
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password)
    };
    req.session.user_id =  userID;
    res.redirect("/urls/");
  }
});








