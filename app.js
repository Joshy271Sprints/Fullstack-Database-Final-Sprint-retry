if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const pool = require("./services/postdb");
const { connectToMongoDB, getDb } = require("./services/Mongodb");
const logQuery = require("./logs/loggers");
connectToMongoDB();

const initializePassport = require("./passport-config");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.post("/search", async (req, res) => {
  const searchQuery = req.body.searchQuery;
  const dataSource = req.body.dataSource;

  try {
    let cars = [];

    if (dataSource === "postgreSQL") {
      const query =
        "SELECT car_make, car_model, car_modelyear FROM cars WHERE car_make ILIKE $1";
      const result = await pool.query(query, [`%${searchQuery}%`]);

      if (result && Array.isArray(result.rows)) {
        cars = result.rows;
      } else {
        throw new Error("Invalid result format from PostgreSQL query");
      }
    } else if (dataSource === "mongoDB") {
      const db = getDb("FinalSprintCars");
      const collection = db.collection("cars");
      cars = await collection
        .find({ car_make: { $regex: searchQuery, $options: "i" } })
        .toArray();
    }

    // Log the query
    if (req.isAuthenticated()) {
      logQuery(req.user.id, searchQuery, dataSource);
    } else {
      logQuery("anonymous", searchQuery);
    }

    res.render("results", { cars });
  } catch (error) {
    console.error(error);
    res.send("An error occurred.");
  }
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect("/");
  }
  next();
}

app.listen(3000);
