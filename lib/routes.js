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
        request.server.microauth.setCookie(reply, token);
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
        reply.unstate(config.cookie.name).redirect(nextUrl);
      }
    });
  }
};
