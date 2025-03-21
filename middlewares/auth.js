const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../utils/config");
const { UNAUTHORIZED_ERROR_CODE } = require("../utils/errors/unauthorized-err");

const authorize = (req, res, next) => {
  console.log(req);
  const { authorization } = req.headers;
  console.log(authorization);

  if (!authorization || !authorization.startsWith("Bearer ")) {
    next(new UNAUTHORIZED_ERROR_CODE("Authorization Required"));
  }

  const token = authorization.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    next(new UNAUTHORIZED_ERROR_CODE("Invalid Token"));
  }
};

module.exports = { authorize };
