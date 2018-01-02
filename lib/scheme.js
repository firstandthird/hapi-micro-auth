const Boom = require('boom');

module.exports = function(server, options) {
  const config = this;
  return {
    async authenticate(request, h) {
      const token = server.microauth.getTokenFromRequest(request);
      const unauthenticated = function (err, result) {
        h.unstate(config.cookie.name);
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
      return h.authenticated({ credentials: user });
    }
  };
};
