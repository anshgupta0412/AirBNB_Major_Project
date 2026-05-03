if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
};

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session"); 
const MongoStore = require("connect-mongo").default;

const dbURL = process.env.ATLASDB_URL;  


const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", (err) => {
  console.log("ERROR in MONGO SESSION STORE:", err);
});

app.use(session({
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
}));

// app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}

app.use((req, res, next) => {
  res.locals.success= req.flash("success");
  res.locals.error= req.flash("error");
  res.locals.currUser= req.user;
  next();
});

app.get("/getcookies", (req, res) => {
    res.cookie("greet", "hello");
    res.send("send you some cookies");
});

app.get("/demouser", async(req, res) => {
  let fakeUser = new User({
    email: "student@gmail.com",
    username: "delta-student",
  });

  let registeredUser = await User.register(fakeUser, "helloworld");
  res.send(registeredUser);
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", userRouter);

app.get("/listings/:id", wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("listings/show.ejs", { listing });
}));

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found!!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!!" } = err;
  res.status(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("listening on port: 8080");
});
