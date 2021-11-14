const { User } = require("../model/User.model");
exports.createUser = async function createUser(user) {
  const [createdUser, isCreated] = await User.findOrCreate({
    where: { email: user.email },
    defaults: user,
  });
  return isCreated;
};
