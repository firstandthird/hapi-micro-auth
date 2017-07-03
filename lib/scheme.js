const Boom = require('boom');
module.exports = function(server, options) {
  const config = this;
  return {
    authenticate(request, reply) {
      const token = server.microauth.getTokenFromRequest(request);
      if (!token) {
        const redirectTo = `${config.hostRedirect}/login?next=${encodeURIComponent(request.url.path)}`;
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
