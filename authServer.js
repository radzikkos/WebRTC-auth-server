const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

app.use(express.json());
const cors = require("cors");
app.use(cors());

const { User } = require("./model/User.model");

app.get("/user/:token", authenticateTokenInUrl, (req, res) => {
  res
    .status(200)
    .json({ authenticated: true, token: req.params.token, user: req.user });
});

app.post("/user", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
    };
    const { isCreated, createdUser } = await createUser(user);
    if (isCreated) {
      res.status(201).json({
        msg: "User created successfully",
        user: createdUser,
      });
    } else {
      res.status(200).json({
        msg: "User with this email already exists",
        user: createdUser,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal error" });
  }
});

app.post("/user/login", authenticateUser, async (req, res) => {
  const user = req.user;
  const token = jwt.sign(user, process.env.SECRET_TOKEN_SEED, {
    /*expiresIn: "30m",*/
  });
  res.status(200).json({ token, user: req.user });
});

console.log("Listen on port " + process.env.PORT);
app.listen(process.env.PORT);

async function authenticateUser(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user === null)
    return res
      .status(401)
      .json({ msg: "User with this email is not signed up" });
  try {
    if (await bcrypt.compare(password, user.get("password"))) {
      //generate TOKEN
      req.user = {
        id: user.dataValues.id,
        firstname: user.dataValues.firstname,
        lastname: user.dataValues.lastname,
        email: user.dataValues.email,
      };
      next();
    } else {
      res.status(401).json({ msg: "Not allowed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal error" });
  }
}
async function authenticateTokenInUrl(req, res, next) {
  const { token } = req.params;
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_TOKEN_SEED, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

async function createUser(user) {
  const [createdUser, isCreated] = await User.findOrCreate({
    where: { email: user.email },
    defaults: user,
  });
  const createdUserData = createdUser.dataValues;
  return {
    isCreated,
    createdUser: prepareCreatedUserResponse(createdUserData),
  };
}
function prepareCreatedUserResponse(user) {
  return {
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
  };
}
