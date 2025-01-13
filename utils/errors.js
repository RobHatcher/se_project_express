module.exports = {
  BAD_REQUEST: {
    code: 400,
    message: "Bad Request",
    type: "Generic",
  },
  VALIDATION_ERROR: {
    code: 400,
    message: "Validation Error",
    type: "Validation",
  },
  UNAUTHORIZED_ERROR_CODE: {
    code: 401,
    message: "Authorization Required",
    type: "Authorization",
  },
  FORBIDDEN_ERROR: {
    code: 403,
    message: "You do not have authorization to delete this item",
    type: "Permission",
  },
  NOT_FOUND: {
    code: 404,
    message: "Resource Not Found",
    type: "Resource",
  },
  CONFLICT: {
    code: 409,
    message: "Email Already Exists",
    type: "Duplicate",
  },
  INTERNAL_SERVER_ERROR: {
    code: 500,
    message: "Internal Server Error",
    type: "Server",
  },
};
