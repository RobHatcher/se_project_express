const ClothingItem = require("../models/clothingItem");
const { INTERNAL_SERVER_ERROR } = require("../ultils/errors");

const createItem = (req, res) => {
  const { name, weather, imageURL } = req.body;

  ClothingItem.create({ name, weather, imageURL })
    .then((item) => {
      console.log(item);
      res.send({ data: item });
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from createItem", err });
    });
};

const getItems = (req, res) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from getItems", err });
    });
};

const updateItem = (req, res) => {
  const {itemId} = req.params;
  const {imageURL} = req.body;

  ClothingItem.findByIdAndUpdate(itemId, {$set: {imageURL}}).orFail().then((item) => res.status(200).send({data: item}))
  .catch((err) => {
    res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from updateItem", err })})
}

const deleteItem = (req, res) => {
  const{itemId} = req.params;

  console.log(itemId);
  ClothingItem.findByIdAndDelete(itemId).orFail().then((item) => res.status(204).send({}))
  .catch((err) => {
    res.status(INTERNAL_SERVER_ERROR).send({ message: "Error from deleteItem", err })})
}
module.exports = { createItem, getItems, updateItem, deleteItem };
