const Boom = require('boom');
const wreck = require('wreck');

module.exports = function(server, options) {
  const config = this;
  return {
    async authenticate(request, h) {
      const token = server.microauth.getTokenFromRequest(request);
      const unauthenticated = function (err, result) {
        h.unstate(config.cookie.name);

        if (config.noRedirect) {
          // Just pass through the error
          throw err;
        }

        if (config.redirectOnTry === false && request.auth.mode === 'try') {
          return h.unauthenticated();
        }

        const next = `?next=${encodeURIComponent(request.url.path)}`;
        let redirectTo = `${config.hostRedirect}${config.routes.login}${next}`;
        if (config.redirectTo) {
          redirectTo = `${config.redirectTo}${next}`;
        }
        return h.response('You are being redirected...').takeover().redirect(redirectTo);
      };

      if (!token) {
        return unauthenticated(Boom.unauthorized());
      }
      // if using cache get it with the caching method:
      let user;
      if (config.cacheEnabled) {
        user = await server.microauth.userCache.get(token);
      } else {
        // otherwise just get it from micro-auth:
        user = await server.microauth.getMe(token);
      }

      if (!user) {
        return unauthenticated(Boom.unauthorized());
      }

      // The user is valid!

      // If the lastSessionDateSet has not been set, update the user in micro-auth and set a session
      // cookie to prevent an update on every request.
      if (!request.state.lastSessionDateSet) {
        const updateResponse = await server.microauth.updateLastSessionDate(token);
        h.state('lastSessionDateSet', '1', { ttl: null, isSecure: false, isSameSite: false });
      }

      return h.authenticated({ credentials: user });
    }
  };
};
