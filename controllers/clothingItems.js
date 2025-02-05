const ClothingItem = require("../models/clothingItem");
const Errors = require("../utils/errors");

const createItem = (req, res) => {
  const { name, weather, imageUrl } = req.body;
  const owner = req.user._id;

  ClothingItem.create({ name, weather, imageUrl, owner })
    .then((item) => res.status(201).send(item))
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(Errors.VALIDATION_ERROR.code)
          .send({ message: Errors.VALIDATION_ERROR.message });
      }
      return res
        .status(Errors.INTERNAL_SERVER_ERROR.code)
        .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.log(err);
      res
        .status(Errors.INTERNAL_SERVER_ERROR.code)
        .send({ message: Errors.INTERNAL_SERVER_ERROR.message });
    });
};

const deleteItem = (req, res) => {
  const { itemId } = req.params;
  const userId = req.user?._id;

  if (!itemId) {
    res
      .status(Errors.BAD_REQUEST.code)
      .send({ message: Errors.BAD_REQUEST.message });
    return;
  }

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (!item.owner.equals(userId)) {
        return res
          .status(Errors.FORBIDDEN_ERROR.code)
          .send({ message: Errors.FORBIDDEN_ERROR.message });
      }

      return ClothingItem.findByIdAndDelete(itemId).then((deletedItem) => {
        if (!deletedItem) {
          return res
            .status(Errors.NOT_FOUND.code)
            .send({ message: Errors.NOT_FOUND.message });
        }
        return res.status(200).send({ message: "Item Deleted", deleteItem });
      });
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

const likeItem = (req, res) => {
  console.log(req.params);
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.status(200).send(item);
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

const dislikeItem = (req, res) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send(item))
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

module.exports = {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
};
