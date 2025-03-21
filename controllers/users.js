const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const { BAD_REQUEST_CODE } = require("../utils/errors/bad-request-err");
const { NOT_FOUND_CODE } = require("../utils/errors/not-found-err");
const {
  INTERNAL_SERVER_ERROR_CODE,
} = require("../utils/errors/internal-server-err");
const { CONFLICT_CODE } = require("../utils/errors/conflict-err");
const { UNAUTHORIZED_ERROR_CODE } = require("../utils/errors/unauthorized-err");
const JWT_SECRET = require("../utils/config");

const getCurrentUser = (req, res, next) => {
  const userId = req.user?._id;
  return User.findById(userId)
    .orFail()
    .select("-password")
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NOT_FOUND_CODE("User Not Found"));
      }
      if (err.name === "CastError") {
        next(new BAD_REQUEST_CODE("User Not Found"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Service Error"));
    });
};

const createUser = (req, res, next) => {
  try {
    const { name, avatar, email, password } = req.body;
    console.log(req.body);

    if (!name || !avatar || !email || !password) {
      next(new BAD_REQUEST_CODE("User Not Found"));
    }

    if (!validator.isURL(avatar)) {
      next(new BAD_REQUEST_CODE("Invalid Data"));
    }

    if (!validator.isEmail(email)) {
      next(new BAD_REQUEST_CODE("Invalid Data"));
    }

    User.findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          throw new CONFLICT_CODE("This Email is Already in Use");
        }
        return bcrypt.hash(password, 10);
      })
      .then((hashedPassword) => {
        if (!hashedPassword) return null;

        return User.create({ name, avatar, email, password: hashedPassword });
      })
      .then((user) => {
        if (user) {
          const userObject = user.toObject();
          delete userObject.password;
          res.status(201).send(userObject);
        }
      })
      .catch((err) => {
        console.error("Error occured in Add User Request:", err);

        if (err.name === "ValidationError") {
          next(new BAD_REQUEST_CODE("Invalid Data"));
        }

        if (err.statusCode === 409) {
          next(new CONFLICT_CODE("This Email is Already in Use"));
        } else {
          next(err);
        }
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
  }
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  if (!name || !avatar) {
    next(new BAD_REQUEST_CODE("User Not Found"));
  }

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .select("-password")
    .then((user) => {
      if (!user) {
        next(new NOT_FOUND_CODE("User Not Found"));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BAD_REQUEST_CODE("Invalid Data"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BAD_REQUEST_CODE("The Password and Email Fields are Required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({
        token,
        user: {
          name: user.name,
          avatar: user.avatar,
          email: user.email,
          _id: user._id,
        },
      });
    })
    .catch((err) => {
      if (err.message === "Incorrect Email or Password") {
        next(new UNAUTHORIZED_ERROR_CODE("Incorrect Email or Password"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
    });
};

module.exports = { getCurrentUser, createUser, updateUser, login };
