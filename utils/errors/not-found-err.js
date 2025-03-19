class NOT_FOUND_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

module.exports = {
  NOT_FOUND_CODE,
};