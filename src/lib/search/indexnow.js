const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidIndexNowKey(key) {
  return INDEXNOW_KEY_PATTERN.test(key);
}

export function indexNowKeyResponse(input) {
  if (!isValidIndexNowKey(input.configuredKey) || input.requestedKey !== input.configuredKey) {
    return {
      status: 404,
      body: "Not found"
    };
  }

  return {
    status: 200,
    body: input.configuredKey
  };
}
