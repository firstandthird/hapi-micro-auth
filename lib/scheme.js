module.exports = function(server, options) {
  const config = this;
  return {
    authenticate(request, reply) {
      const token = server.microauth.getTokenFromRequest(request);
      if (!token) {
        const redirectTo = `${config.hostRedirect}/login?next=${encodeURIComponent(request.url.path)}`;
        return reply.redirect(redirectTo);
      }

      server.microauth.userCache.get(token, (err, user, info) => {
        // if result is invalid remove the cookie and continue
        if (err || !user) {
          reply.unstate(config.cookie.name);
          return reply.continue();
        }
        reply.continue({ credentials: user });
      });
    }
  };
};
