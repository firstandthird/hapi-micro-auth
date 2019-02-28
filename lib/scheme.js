const Boom = require('boom');

module.exports = function(server, options) {
  const config = this;
  return {
    async authenticate(request, h) {
      const token = server.microauth.getTokenFromRequest(request);
      const unauthenticated = function (err, result) {
        if (request.state[config.cookie.name]) {
          h.unstate(config.cookie.name);
        }

        if (config.noRedirect) {
          // Just pass through the error
          throw err;
        }

        if (config.redirectOnTry === false && request.auth.mode === 'try') {
          return h.unauthenticated();
        }

        const next = `?next=${encodeURIComponent(request.path)}`;
        let redirectTo = `${config.hostRedirect}${config.routes.login}${next}`;
        if (config.redirectTo) {
          redirectTo = `${config.redirectTo}${next}`;
        }
        return h.response('You are being redirected...').takeover().redirect(redirectTo);
      };

      if (!token || !token.length || token === 'undefined') {
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
      if (config.trackLastSession && !request.state.lastSessionDateSet) {
        const ua = request.headers['user-agent'];
        await server.microauth.updateLastSessionDate(token, ua);
        h.state(config.sessionDateCookie.name, '1', {
          ttl: config.sessionDateCookie.ttl,
          isSecure: config.sessionDateCookie.isSecure,
          isSameSite: config.sessionDateCookie.isSameSite
        });
      }

      return h.authenticated({ credentials: user });
    }
  };
};
