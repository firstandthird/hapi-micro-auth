module.exports = function(request) {
  const config = this;
  const queryToken = request.query[config.queryKey];
  if (queryToken) {
    return queryToken;
  }
  const cookieToken = request.state[config.cookieName];
  if (cookieToken) {
    return cookieToken;
  }
  return false;
};
