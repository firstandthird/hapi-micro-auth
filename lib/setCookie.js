module.exports = function(h, token) {
  const config = this;
  h.state(config.cookie.name, token, { isSameSite: 'Lax' });
};
