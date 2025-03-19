const ClothingItem = require("../models/clothingItem");
const { BAD_REQUEST_CODE } = require("../utils/errors/bad-request-err");
const { NOT_FOUND_CODE } = require("../utils/errors/not-found-err");
const { FORBIDDEN_ERROR_CODE } = require("../utils/errors/forbidden-err");
const {
  INTERNAL_SERVER_ERROR_CODE,
} = require("../utils/errors/internal-server-err");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BAD_REQUEST_CODE("Invalid Data"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      next(new INTERNAL_SERVER_ERROR_CODE("Error from getItems"));
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!itemId) {
    next(new BAD_REQUEST_CODE("Invalid ID Format"));
    return;
  }

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(userId)) {
        return next(new FORBIDDEN_ERROR_CODE("Forbidden Error"));
      }

      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) => {
        if (!deletedItem) {
          return next(new NOT_FOUND_CODE("Item Not Found"));
        }
        return res.status(200).send({ message: "Item Deleted", deleteItem });
      });
    })

    .catch(() => {
      next(new INTERNAL_SERVER_ERROR_CODE("Error From deleteItem"));
    });
};

const likeItem = (req, res, next) => {
  console.log(req.params);
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      if (!item) {
        next(new NOT_FOUND_CODE("Item Not Found"));
      }
      return res.status(200).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
        next(new BAD_REQUEST_CODE("Item Not Found"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail(() => {
      const error = new Error("Card ID Not Found");
      error.statusCode = NOT_FOUND_CODE;
      throw error;
    })
    .then((item) => {
      res.status(200).send({ data: item });
    })
    .catch((err) => {
      if (err.statusCode === NOT_FOUND_CODE) {
        next(new NOT_FOUND_CODE("Item Not Found"));
      }
      next(new INTERNAL_SERVER_ERROR_CODE("Internal Server Error"));
    });
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
