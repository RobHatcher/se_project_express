const router = require("express").Router();
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateInfoBody } = require("../validation");

router.get("/me", getCurrentUser);
router.patch("/me", validateInfoBody, updateUser);

module.exports = router;
