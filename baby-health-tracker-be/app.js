// Load environment variables first
require("dotenv").config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var bcrypt = require("bcryptjs");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var apiRouter = require("./routes/api");
var connectDB = require("./configs/MongoDBConfig");
var accountService = require("./services/accountService");

var app = express();

const ensureAdminAccount = async () => {
  const email = "admin@example.com";
  const password = "123456";

  try {
    const existing = await accountService.findAccountByEmail(email);
    if (existing) {
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await accountService.createAccount({
      email,
      password: hashedPassword,
      role: "admin",
      is_verified: true,
    });

    console.log("Admin account created");
  } catch (error) {
    console.error("Admin account seed error:", error.message);
  }
};

connectDB().then(() => ensureAdminAccount());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "http://localhost:5173",
//     "exp://192.168.2.206:8081"
//   ]
// }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const config = require("./configs/Config");
console.log("=== KIỂM TRA ENV TRÊN RENDER ===");
console.log("MONGODB_URI có tồn tại không?", config.MONGODB_URI ? "CÓ" : "KHÔNG");
console.log("Chiều dài MONGODB_URI:", config.MONGODB_URI ? config.MONGODB_URI.length : 0);

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const statusCode = err.status || 500;
  const payload = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  if (req.app.get("env") === "development") {
    payload.error = err;
  }

  res.status(statusCode);

  const acceptHeader = req.headers.accept || "";
  const prefersHtml = acceptHeader.includes("text/html");

  if (req.originalUrl.startsWith("/api") || !prefersHtml) {
    return res.json(payload);
  }

  return res.send(payload.message);
});

module.exports = app;
