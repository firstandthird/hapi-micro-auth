const aug = require('aug');
const getMe = require('./lib/getMe');
const getUser = require('./lib/getUser');
const getTokenFromRequest = require('./lib/getTokenFromRequest');
const setCookie = require('./lib/setCookie');
const scheme = require('./lib/scheme');

const defaults = {
  host: '',
  queryKey: 'token',
  cookie: {
    name: 'token',
    ttl: 1000 * 60 * 60 * 24 * 30, //30 days
    setRoute: '/login'
  },
  strategy: {
    name: 'microauth',
    mode: true
  }
};

exports.register = function(server, options, next) {
  const config = aug('defaults', defaults, options);

  if (!config.host) {
    return next(new Error('host must be set'));
  }

  const expose = {
    getMe: getMe.bind(config),
    getUser: getUser.bind(config),
    getTokenFromRequest: getTokenFromRequest.bind(config),
    setCookie: setCookie.bind(config)
  };

  server.decorate('server', 'microauth', expose);

  server.auth.scheme('microauth', scheme);

  if (config.strategy) {
    server.auth.strategy(config.strategy.name, 'microauth', config.strategy.mode, {});
  }

  if (config.cookie.setRoute) {
    server.route({
      path: config.cookie.setRoute,
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
};

exports.register.attributes = {
  pkg: require('./package.json')
};
