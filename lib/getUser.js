const wreck = require('@hapi/wreck');
const Boom = require('@hapi/boom');

module.exports = async function(userToken) {
  const config = this;
  const response = await wreck.get(`${config.host}/api/users/${userToken}`, { json: true });
  if (!response || !response.payload) {
    return Boom.notFound();
  }

  return response.payload;
};
