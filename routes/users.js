const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateUserId } = require("../middlewares/validation");

router.get("/me", getCurrentUser);
router.patch("/me", validateUserId, updateUser);

module.exports = router;
