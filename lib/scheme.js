module.exports = function(server, options) {
  const config = this;
  return {
    authenticate(request, reply) {
      const token = server.microauth.getTokenFromRequest(request);
      if (!token) {
        const next = `?next=${encodeURIComponent(request.url.path)}`;
        let redirectTo = `${config.hostRedirect}${config.routes.login}${next}`;

        if (config.redirectTo) {
          redirectTo = `${config.redirectTo}${next}`;
        }

        return reply.redirect(redirectTo);
      }
      // if using cache get it with the caching method:
      if (config.cacheEnabled) {
        return server.microauth.userCache.get(token, (err, user, info) => {
          // if result is invalid remove the cookie and redirect back to login
          if (err || !user) {
            reply.unstate(config.cookie.name);
            const redirectTo = `${config.hostRedirect}${config.routes.login}?next=${encodeURIComponent(request.url.path)}`;
            return reply.redirect(redirectTo);
          }
          reply.continue({ credentials: user });
        });
      }
      // otherwise just get it from micro-auth:
      server.microauth.getMe(token, (err, user) => {
        if (err || !user) {
          reply.unstate(config.cookie.name);
          const redirectTo = `${config.hostRedirect}${config.routes.login}?next=${encodeURIComponent(request.url.path)}`;
          return reply.redirect(redirectTo);
        }
        reply.continue({ credentials: user });
      });
    }
  };
};
