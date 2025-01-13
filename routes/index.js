const router = require("express").Router();
const Errors = require("../utils/errors");
const { authorize } = require("../middlewares/auth");

const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");

router.post("/signup", createUser);
router.post("/signin", login);

router.use("/users", authorize, userRouter);
router.use("/items", itemRouter);

router.use((req, res) =>
  res.status(Errors.NOT_FOUND.code).send({ message: Errors.NOT_FOUND.message })
);

module.exports = router;
