const wreck = require('wreck');
const Boom = require('boom');

module.exports = async function(userToken) {
  const config = this;
  const response = await wreck.get(`${config.host}/api/me/${userToken}`, { json: true });
  if (!response.payload) {
    return Boom.notFound();
  }

  return response.payload;
};
