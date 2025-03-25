const ClothingItem = require("../models/clothingItem");
const { BadRequestError } = require("../utils/errors/bad-request-err");
const { NotFoundError } = require("../utils/errors/not-found-err");
const { ForbiddenError } = require("../utils/errors/forbidden-err");
const {
  InternalServerError,
} = require("../utils/errors/internal-server-err");

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Invalid Data"));
      }
      next(new InternalServerError("Internal Server Error"));
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch(() => {
      next(new InternalServerError("Error from getItems"));
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!itemId) {
    next(new BadRequestError("Invalid ID Format"));
    return;
  }

  ClothingItem.findById(itemId)
    .then((item) => {
      if (!item) { return next(new NotFoundError('Item not found')); }

      if (!item.owner.equals(userId)) {
        return next(new ForbiddenError("Forbidden Error"));
      }

      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) => {
        if (!deletedItem) {
          return next(new NotFoundError("Item Not Found"));
        }
        return res.status(200).send({ message: "Item Deleted", deletedItem });
      });
    })

    .catch((err) => {
      if (err.name === "CastError") {
          return next(new BadRequestError("Invalid Item ID"));
      }
      if (err.name === "DocumentNotFoundError") {
          return next(new NotFoundError("Item Not Found"));
      }
      return next(new InternalServerError("Error from deleteItem"));
  });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      if (!item) {
        next(new NotFoundError("Item Not Found"));
      }
      return res.status(200).send(item);
    })
    .catch((err) => {
      if (err.name === "CastError") {
          return next(new BadRequestError("Item Not Found"));
      }
      if (err.name === "DocumentNotFoundError") {
          return next(new NotFoundError("Item Not Found"));
      }
      return next(new InternalServerError("Internal Server Error"));
  });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
  .orFail()
  .then((item) => {
    if (!item) {
      next(new NotFoundError("Item Not Found"));
    }
    return res.status(200).send(item);
  })
  .catch((err) => {
    if (err.name === "CastError") {
        return next(new BadRequestError("Item Not Found"));
    }
    if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item Not Found"));
    }
    return next(new InternalServerError("Internal Server Error"));
});
};

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
