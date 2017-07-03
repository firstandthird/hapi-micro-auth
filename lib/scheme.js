const Boom = require('boom');
module.exports = function(server, options) {
  const config = this;
  return {
    authenticate(request, reply) {
      const token = server.microauth.getTokenFromRequest(request);
      if (!token) {
        const next = `${config.scheme.redirectTo}?next=${request.url.path}`;
        const redirectTo = `${config.hostRedirect}/login?next=${next}`;
        return reply.redirect(redirectTo);
      }

      server.microauth.getMe(token, (err, user) => {
        if (err) {
          return reply(Boom.badRequest('invalid token'));
        }

        reply.continue({ credentials: user });
      });
    }
  };
};
