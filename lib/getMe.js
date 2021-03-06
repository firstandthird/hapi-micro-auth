const wreck = require('@hapi/wreck');
const Boom = require('@hapi/boom');

module.exports = async function(userToken) {
  const config = this;

  if (userToken === 'undefined') {
    return Boom.notFound();
  }

  const response = await wreck.get(`${config.host}/api/me/${userToken}`, { json: true });
  if (!response.payload) {
    return Boom.notFound();
  }

  return response.payload;
};
