const Boom = require('boom');

module.exports = function(server, config) {
  if (config.routes.login) {
    server.route({
      path: config.routes.login,
      method: 'get',
      config: {
        auth: false
      },
      async handler(request, h) {
        const token = request.query.token;
        const nextUrl = request.query.next || '/';
        if (config.cacheEnabled) {
          await server.microauth.userCache.drop(token);
        }
        server.microauth.setCookie(h, token);
        return h.redirect(nextUrl);
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
      async handler(request, h) {
        const nextUrl = request.query.next || '/';
        const token = request.state[config.cookie.name];
        if (config.cacheEnabled) {
          await server.microauth.userCache.drop(token);
        }
        h.unstate(config.cookie.name, { ttl: config.cookie.ttl, isSecure: false, isSameSite: false });
        return h.redirect(nextUrl);
      }
    });
  }

  if (config.routes.hook) {
    const hookSecret = config.hookSecret;
    server.route({
      path: config.routes.hook,
      method: 'post',
      config: {
        auth: false
      },
      async handler(request, h) {
        const secret = request.query.secret;
        if (hookSecret !== false && secret !== hookSecret) {
          throw Boom.unauthorized();
        }
        const payload = request.payload;
        const event = payload.event;
        await server.events.emit(`microauth.${event}`, payload);
        return { success: 1 };
      }
    });
  }
};
