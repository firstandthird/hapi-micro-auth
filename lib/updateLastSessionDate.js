const wreck = require('wreck');
const Boom = require('boom');

module.exports = async function(userToken) {
  const config = this.config;
  const token = typeof userToken === 'object' ? userToken.userToken : userToken;
  const params = {
    payload: {
      token: token,
      lastSessionDate: new Date()
    },
    json: true
  };
  const response = await wreck.put(`${config.host}/api/users`, params);
  return response.payload;
};
