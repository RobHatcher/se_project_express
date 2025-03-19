class BAD_REQUEST_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

module.exports = {
  BAD_REQUEST_CODE,
};