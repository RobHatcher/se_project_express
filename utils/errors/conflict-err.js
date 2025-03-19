class CONFLICT_CODE extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 409;
  }
}

module.exports = {
  CONFLICT_CODE,
};