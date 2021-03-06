module.exports = function(request) {
  const config = this;
  const queryToken = request.query[config.queryKey];
  if (queryToken) {
    return queryToken;
  }
  const cookieToken = request.state[config.cookie.name];

  if (cookieToken && cookieToken.length && cookieToken !== 'undefined') {
    return cookieToken;
  }

  return false;
};
