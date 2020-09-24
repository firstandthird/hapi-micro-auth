const wreck = require('wreck');
const Boom = require('boom');

module.exports = async function(email) {
  const config = this;

  if (email === 'undefined') {
    return Boom.notFound();
  }

  const response = await wreck.get(`${config.host}/api/users/list?email=${email}`, { json: true });
  if (!response.payload) {
    return Boom.notFound();
  }

  return response.payload;
};
