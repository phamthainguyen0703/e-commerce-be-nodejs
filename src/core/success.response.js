"use strict";

const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  CREATED: "CREATED!",
  OK: "SUCCESS",
};

class SuccessResponse {
  constructor(
    message,
    statuscode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {}
  ) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statuscode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}
class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}
class CREATED extends SuccessResponse {
  constructor({
    options = {},
    message,
    statuscode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    metadata,
  }) {
    super({ message, statuscode, reasonStatusCode, metadata });
    this.options = options;
  }
}
module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
