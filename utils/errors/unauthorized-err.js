class UNAUTHORIZED_ERROR_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = {
  UNAUTHORIZED_ERROR_CODE,
};