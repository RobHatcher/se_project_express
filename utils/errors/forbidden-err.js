class FORBIDDEN_ERROR_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 403;
  }
}

module.exports = {
  FORBIDDEN_ERROR_CODE,
};