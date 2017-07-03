module.exports = function(reply, token) {
  const config = this;

  reply.state(config.cookie.name, token, { ttl: config.cookie.tll });
};
