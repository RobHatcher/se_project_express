require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { errors } = require("celebrate");
const mainRouter = require("./routes/index");
const { createUser, login } = require("./controllers/users");
const errorHandler = require("./middlewares/errorHandler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const app = express();
const { PORT = 3001 } = process.env;

mongoose
  .connect("mongodb://127.0.0.1:27017/wtwr_db")
  .then(() => {
    console.log("Connected to DB.");
  })
  .catch(console.error);

  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Server will crash now');
    }, 0);
  });

app.use(express.json());

app.use(cors());

app.use(requestLogger);

app.post("/signup", createUser);
app.post("/signin", login);

app.get('/', (req, res) => {
  res.send('Welcome to the home page');
});

app.use("/", mainRouter);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
