const router = require("express").Router();
const { authorize } = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const { validateCardBody, validateItemId } = require("../validation");

router.post("/", authorize, validateCardBody, createItem);
router.get("/", getItems);
router.delete("/:itemId", authorize, validateItemId, deleteItem);

router.put("/:itemId/likes", authorize, validateItemId, likeItem);
router.delete("/:itemId/likes", authorize, validateItemId, dislikeItem);

module.exports = router;
