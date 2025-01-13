const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const Errors = require("../utils/errors");

const authorize = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res
      .status(Errors.UNAUTHORIZED_ERROR_CODE.code)
      .send({ message: Errors.UNAUTHORIZED_ERROR_CODE.message });
  }

  const token = authorization.replace("Bearer ", "");

  try {
    payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res
      .status(Errors.UNAUTHORIZED_ERROR_CODE.code)
      .send({ message: Errors.UNAUTHORIZED_ERROR_CODE.message });
  }
};

module.exports = { authorize };
