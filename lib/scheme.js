const Boom = require('boom');

module.exports = function(server, options) {
  const config = this;
  return {
    authenticate(request, reply) {
      const token = server.microauth.getTokenFromRequest(request);
      const unauthenticated = function (err, result) {
        reply.unstate(config.cookie.name);

        if (config.redirectOnTry === false && request.auth.mode === 'try') {
          return reply(err, null, result);
        }

        const next = `?next=${encodeURIComponent(request.url.path)}`;
        let redirectTo = `${config.hostRedirect}${config.routes.login}${next}`;
        if (config.redirectTo) {
          redirectTo = `${config.redirectTo}${next}`;
        }
        return reply.redirect(redirectTo);
      };

      if (!token) {
        return unauthenticated(Boom.unauthorized());
      }
      // if using cache get it with the caching method:
      if (config.cacheEnabled) {
        return server.microauth.userCache.get(token, (err, user, info) => {
          // if result is invalid remove the cookie and redirect back to login
          if (err || !user) {
            return unauthenticated(Boom.unauthorized());
          }
          reply.continue({ credentials: user });
        });
      }
      // otherwise just get it from micro-auth:
      server.microauth.getMe(token, (err, user) => {
        if (err || !user) {
          return unauthenticated(Boom.unauthorized());
        }
        reply.continue({ credentials: user });
      });
    }
  };
};
