const wreck = require('@hapi/wreck');
const querystring = require('querystring');

module.exports = async function(query = {}) {
  const config = this;

  const { payload } = await wreck.get(`${config.host}/api/users?${querystring.stringify(query)}`, { json: true });

  if (!payload) {
    return [];
  }

  return payload.users;
};
