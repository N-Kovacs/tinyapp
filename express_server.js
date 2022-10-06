const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs")
const app = express();


const PORT = 8080; // default port 8080

app.use(cookieParser());
app.set("view engine", "ejs");


const generateRandomString = function () {
  let poschar = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += poschar.charAt(Math.floor(Math.random() * poschar.length));
  }
  return result;
};

const userNameCheck = function (emailCheck) {
  for (const user in users) {
    if (users[user].email === emailCheck) {
      return true;
    }
  }
  return false;
};

const urlsForUser = function (id) {
  let outputURLS = {};
  for (const url in urlDatabase) {
    if (users[id].id === urlDatabase[url].userID) {
      outputURLS[url] = urlDatabase[url];
    }
  }
  return outputURLS;

};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  // if (!(urlDatabase[req.cookies["user_id"]])) {
  //   res.redirect("/urls/new")
  //   //temporary invalid cookie chatch

  // } else 
  if ((req.cookies["user_id"]) && (users[req.cookies["user_id"]])) {
    console.log(urlDatabase[req.cookies["user_id"]])
    console.log(req.cookie);
    let userURL = urlsForUser(req.cookies["user_id"]);
    console.log(userURL);
    const templateVars = {
      urls: userURL,
      users: users,
      user_id: req.cookies["user_id"]
    }; 

    res.render("urls_index", templateVars);
  } else {
    res.redirect("/urls/new");
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies["user_id"]
  };
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies["user_id"]
  };
  if (req.cookies["user_id"]) {
    res.redirect("/urls");
  }
  res.render("login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { users: users, user_id: req.cookies["user_id"] };
  if (!(req.cookies["user_id"])) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
}); 

app.get("/urls/:id", (req, res) => {
  if ((req.cookies["user_id"]) === urlDatabase[req.params.id].userID) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      users: users,
      user_id: req.cookies["user_id"]
    };
    res.render("urls_show", templateVars);
  } else if ((req.cookies["user_id"])) {
    res.status(401);
    res.send('401: You do not own this cookie');
  } else {
    res.status(401);
    res.send('401: Must be logged in');
  }
});

app.post("/urls", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  if ((req.cookies["user_id"])) {
    let randString = generateRandomString();
    urlDatabase[randString] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
    console.log(urlDatabase);
    res.redirect("/urls/" + randString);

  } else {
    res.status(401);
    res.send('401: Must be logged in to post urls');
  }


});

app.post("/urls/:id", (req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // console.log(urlDatabase)
  // console.log(req.params.id)
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.send('URL not found');
  } else if ((req.cookies["user_id"]) === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    console.log(urlDatabase[req.params.id]);
    res.redirect("/urls/");
  } else {
    res.status(401);
    res.send('401: You do not own this url to edit');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.status(404);
    res.send('URL not found');
  } else if ((req.cookies["user_id"]) === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  } else {
    res.status(401);
    res.send('You do not own this url to delete');
  }
});

app.post("/login", (req, res) => {
  for (const user in users) {
    if (users[user].email === req.body.email) {
      console.log(users)
      if (bcrypt.compareSync((req.body.password), users[user].password)) {
        res.cookie("user_id", users[user].id);
        res.redirect("/urls/");
      } else {
        res.status(403);
        res.send('403: Log in failed');
      }
    } else {
      res.status(403);
      res.send('403: Log in failed');
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});


app.post("/register", (req, res) => {
  userID = generateRandomString();
  if (userNameCheck(req.body.email) || req.body.email === "" || req.body.password === "") {
    res.status(400);
    res.send('400: Error creating email, please try again');
  } else {
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password)
    };
    res.cookie("user_id", userID);
    res.redirect("/urls/");

  }


});


app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]){
    console.log(urlDatabase);
    console.log(urlDatabase[req.params.id].longURL);
    let direct = urlDatabase[req.params.id].longURL;
      res.redirect(direct);
  } else {
    res.status(404);
    res.send('404: Redirect does not exist')
}



});





