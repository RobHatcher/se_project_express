const router = require("express").Router();
const { NOT_FOUND_CODE } = require("../utils/errors/not-found-err");
const { authorize } = require("../middlewares/auth");

const userRouter = require("./users");
const itemRouter = require("./clothingItems");
const { createUser, login } = require("../controllers/users");

router.post("/signup", createUser);
router.post("/signin", login);

router.use("/users", authorize, userRouter);
router.use("/items", itemRouter);

router.use((req, res, next) => {
  next(new NOT_FOUND_CODE("Router Not Found"));
});

module.exports = router;
