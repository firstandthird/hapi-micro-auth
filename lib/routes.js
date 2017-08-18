module.exports = function(server, config) {
  if (config.routes.login) {
    server.route({
      path: config.routes.login,
      method: 'get',
      config: {
        auth: false
      },
      handler(request, reply) {
        const token = request.query.token;
        const nextUrl = request.query.next || '/';
        if (config.cacheEnabled) {
          return server.microauth.userCache.drop(token, (err) => {
            if (err) {
              return reply(err);
            }
            server.microauth.setCookie(reply, token);
            reply.redirect(nextUrl);
          });
        }
        server.microauth.setCookie(reply, token);
        reply.redirect(nextUrl);
      }
    });
  }
  if (config.routes.logout) {
    server.route({
      path: config.routes.logout,
      method: 'get',
      config: {
        auth: false
      },
      handler(request, reply) {
        const nextUrl = request.query.next || '/';
        const token = request.state.token;
        if (config.cacheEnabled) {
          return server.microauth.userCache.drop(token, (err) => {
            if (err) {
              return reply(err);
            }
            reply.unstate(config.cookie.name);
            reply.redirect(nextUrl);
          });
        }
        reply.unstate(config.cookie.name);
        reply.redirect(nextUrl);
      }
    });
  }
};
