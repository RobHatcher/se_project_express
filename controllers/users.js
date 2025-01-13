const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const Errors = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const getCurrentUser = (req, res) => {
  const userId = req.user?._id;
  return User.findById(userId)
    .orFail()
    .select("-password")
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res
          .status(Errors.NOT_FOUND.code)
          .send({ message: Errors.NOT_FOUND.message });
      }
      if (err.name === "CastError") {
        return res
          .status(Errors.BAD_REQUEST.code)
          .send({ message: Errors.BAD_REQUEST.message });
      }
      return res
        .status(Errors.INTERNAL_SERVER_ERROR.code)
        .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
    });
};

const createUser = (req, res) => {
  try {
    const { name, avatar, email, password } = req.body;

    if (!name || !avatar || !email || !password) {
      res
        .status(Errors.BAD_REQUEST.code)
        .send({ message: Errors.BAD_REQUEST.message });
      return;
    }

    if (!validator.isURL(avatar)) {
      res
        .status(Errors.VALIDATION_ERROR.code)
        .send({ message: Errors.VALIDATION_ERROR.message });
      return;
    }

    if (!validator.isEmail(email)) {
      res
        .status(Errors.VALIDATION_ERROR.code)
        .send({ message: Errors.VALIDATION_ERROR.message });
      return;
    }

    User.findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          const error = new Error("Email already exists");
          error.code = 11000;
          throw error;
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
          res
            .status(Errors.VALIDATION_ERROR.code)
            .send({ message: Errors.VALIDATION_ERROR.message });
          return;
        }

        if (err.code === 11000) {
          res
            .status(Errors.CONFLICT.code)
            .send({ message: Errors.CONFLICT.message });
          return;
        }

        res
          .status(Errors.INTERNAL_SERVER_ERROR.code)
          .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    res
      .status(Errors.INTERNAL_SERVER_ERROR.code)
      .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
  }
};

const updateUser = (req, res) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  if (!name || !avatar) {
    res
      .status(Errors.BAD_REQUEST.code)
      .send({ message: Errors.BAD_REQUEST.message });
    return;
  }

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .select("-password")
    .then((user) => {
      if (!user) {
        res
          .status(Errors.NOT_FOUND.code)
          .send({ message: Errors.NOT_FOUND.message });
        return;
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        res
          .status(Errors.VALIDATION_ERROR.code)
          .send({ message: Errors.VALIDATION_ERROR.message });
        return;
      }
      if (err.name === "CastError") {
        res
          .status(Errors.BAD_REQUEST.code)
          .send({ message: Errors.BAD_REQUEST.message });
        return;
      }
      res
        .status(Errors.INTERNAL_SERVER_ERROR.code)
        .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(Errors.BAD_REQUEST.code)
      .send({ message: Errors.BAD_REQUEST.message });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return res
          .status(Errors.UNAUTHORIZED_ERROR_CODE.code)
          .send({ message: Errors.UNAUTHORIZED_ERROR_CODE.message });
      }
      return res
        .status(Errors.INTERNAL_SERVER_ERROR.code)
        .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
    });
};

module.exports = { getCurrentUser, createUser, updateUser, login };
