const wreck = require('wreck');

module.exports = async function(userToken, userAgent) {
  const config = this.config;
  const token = typeof userToken === 'object' ? userToken.userToken : userToken;
  const params = {
    payload: {
      token,
      userAgent,
      incSessions: 1,
      lastSessionDate: new Date()
    },
    json: true
  };
  const response = await wreck.put(`${config.host}/api/users`, params);
  return response.payload;
};
