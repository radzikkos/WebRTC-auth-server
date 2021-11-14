const { User } = require("../model/User.model");
require("dotenv").config();
exports.authenticateUser = async function authenticateUser(req, res, next) {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (user === null)
    return res
      .status(401)
      .json({ msg: "User with this email is not signed up" });
  try {
    if (await bcrypt.compare(password, user.get("password"))) {
      //generate TOKEN
      next();
    } else {
      res.status(401).json({ msg: "Not allowed" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal error" });
  }
};
exports.authenticateTokenInUrl = function authenticateTokenInUrl(
  req,
  res,
  next
) {
  const { token } = req.params;
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
