const wreck = require('@hapi/wreck');

module.exports = async function(userToken, newMetadata) {
  const config = this.config;
  const token = typeof userToken === 'object' ? userToken.userToken : userToken;
  const response = await wreck.put(`${config.host}/api/users/meta?token=${token}`, { payload: newMetadata, json: true });
  return response.payload;
};
