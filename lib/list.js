const wreck = require('wreck');
const querystring = require('querystring');

module.exports = async function(query = {}) {
  const config = this;
  let more = false;
  let all = [];
  do {
    /* eslint-disable-next-line */
    const { payload } = await wreck.get(`${config.host}/api/users/list?${querystring.stringify(query)}`, { json: true });
    if (!payload) {
      return [];
    }
    more = payload.more;
    all = all.concat(payload.users);
  } while (more);
  return all;
};
