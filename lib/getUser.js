const wreck = require('wreck');
const Boom = require('boom');

module.exports = async function(userToken, done) {
  const config = this;
  const response = await wreck.get(`${config.host}/api/users/${userToken}`, { json: true });
  if (!response || !response.payload) {
    return Boom.notFound();
  }

  return response.payload;

};
