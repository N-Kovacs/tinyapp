const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();

const PORT = 8080; // default port 8080

app.use(cookieParser())
app.set("view engine", "ejs");


const generateRandomString =function() {
  let poschar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += poschar.charAt(Math.floor(Math.random() * poschar.length));
  }
  return result;
}

const userNameCheck = function(emailCheck){
  for (const user in users){
    if (users[user].email === emailCheck){
      return true
    }
  }
  return false
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  exampleuser: {
    id: "exampleuser",
    email: "user@example.com",
    password: "i<3examples",
  }
};


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  console.log(req.cookie)
  const templateVars = { 
    urls: urlDatabase,
    users: users,
    user_id: req.cookies["user_id"]
  };
  
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users: users, 
    user_id: req.cookies["user_id"]
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    users: users, 
    user_id: req.cookies["user_id"]
  };
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars= { users: users, user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id,
    longURL: urlDatabase[req.params.id], 
    users: users, 
    user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  let randString = generateRandomString();
  urlDatabase[randString] = req.body.longURL;
  res.redirect("/urls/" + randString);
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  console.log(urlDatabase)
  console.log(req.params.id)
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
  
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if(users[user].email === req.body.email){
      if(users[user].password === req.body.password){
        res.cookie("user_id", users[user].id)
        res.redirect("/urls/")
      }
    }
  }
  res.status(400);
  res.send('403: Log in failed')
});

app.post("/logout", (req, res) => {
  // console.log(req.body.login)
  // console.log('Cookies: ', req.cookies)
  res.clearCookie("user_id");
  // console.log('Cookies: ', req.cookies)
  res.redirect("/urls/");
});


app.post("/register", (req, res) => {
  userID = generateRandomString();
  if (userNameCheck(req.body.email) || req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('400: Error creating email, please try again')
  } else{
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    }
    res.cookie("user_id", userID)
    res.redirect("/urls/");

  }


});


app.get("/u/:id", (req, res) => {
  longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});





