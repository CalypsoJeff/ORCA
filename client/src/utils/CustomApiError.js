class CustomApiError extends Error {
  constructor(message, customData, status = null) {
    super(message);
    this.name = this.constructor.name;
    this.data = customData;
    this.status = status;

    Object.setPrototypeOf(this, CustomApiError.prototype);
  }

  getCustomData() {
    return this.data;
  }
}

export default CustomApiError;

  