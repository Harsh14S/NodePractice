const MESSAGES = {
  9999: "Something went wrong!",
};

const getMessage = (messageCode) => {
  if (isNaN(messageCode)) {
    return messageCode;
  }
  return messageCode ? MESSAGES[messageCode] : "";
};

export default getMessage;
