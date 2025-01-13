const router = require("express").Router();
const { authorize } = require("../middlewares/auth");
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");

router.post("/", authorize, createItem);
router.get("/", getItems);
router.delete("/:itemId", authorize, deleteItem);

router.put("/:itemId/likes", authorize, likeItem);
router.delete("/:itemId/likes", authorize, dislikeItem);

module.exports = router;
