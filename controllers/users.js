const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const { BadRequestError } = require("../utils/errors/bad-request-err");
const { NotFoundError } = require("../utils/errors/not-found-err");
const {
  InternalServerError,
} = require("../utils/errors/internal-server-err");
const { ConflictError } = require("../utils/errors/conflict-err");
const { UnauthorizedError } = require("../utils/errors/unauthorized-err");
const { JWT_SECRET } = require("../utils/config");

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
        next(new NotFoundError("User Not Found"));
      }
      if (err.name === "CastError") {
        next(new BadRequestError("User Not Found"));
      }
      next(new InternalServerError("Internal Service Error"));
    });
};

const createUser = (req, res, next) => {
  try {
    const { name, avatar, email, password } = req.body;

    if (!name || !avatar || !email || !password) {
      next(new BadRequestError("User Not Found"));
    }

    if (!validator.isURL(avatar)) {
      next(new BadRequestError("Invalid Data"));
    }

    if (!validator.isEmail(email)) {
      next(new BadRequestError("Invalid Data"));
    }

    User.findOne({ email })
      .then((existingUser) => {
        if (existingUser) {
          throw new ConflictError("This Email is Already in Use");
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
          next(new BadRequestError("Invalid Data"));
        }

        if (err.statusCode === 409) {
          next(new ConflictError("This Email is Already in Use"));
        } else {
          next(err);
        }
      });
  } catch (err) {
    console.error("Unexpected error:", err);
    next(new InternalServerError("Internal Server Error"));
  }
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, avatar } = req.body;

  if (!name || !avatar) {
    next(new BadRequestError("User Not Found"));
  }

  User.findByIdAndUpdate(
    userId,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .select("-password")
    .then((user) => {
      if (!user) {
        next(new NotFoundError("User Not Found"));
      }
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid Data"));
      }
      next(new InternalServerError("Internal Server Error"));
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new BadRequestError("The password and email Fields are required")
    );
  }

  if (!validator.isEmail(email)) {
    return next(new BadRequestError("Invalid email format"));
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
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      } else {
        next(new InternalServerError("Internal Server Error"));
      }
    });
};

module.exports = { getCurrentUser, createUser, updateUser, login };
