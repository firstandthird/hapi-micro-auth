const wreck = require('wreck');
const Boom = require('boom');
module.exports = function(userToken, done) {
  const config = this;
  wreck.get(`${config.host}/api/users/${userToken}`, { json: true }, (err, res, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(Boom.notFound());
    }
    done(null, user);
  });
};
