const wreck = require('wreck');

module.exports = async function(userToken, newSettings) {
  const config = this.config;
  const token = typeof userToken === 'object' ? userToken.userToken : userToken;
  const response = await wreck.put(`${config.host}/api/users/settings?token=${token}`, { payload: newSettings, json: true });
  return response.payload;
};
