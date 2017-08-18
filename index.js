const aug = require('aug');
const getMe = require('./lib/getMe');
const getUser = require('./lib/getUser');
const getTokenFromRequest = require('./lib/getTokenFromRequest');
const setCookie = require('./lib/setCookie');
const scheme = require('./lib/scheme');
const routes = require('./lib/routes');

const defaults = {
  host: '',
  hostRedirect: null,
  queryKey: 'token',
  cookie: {
    name: 'token',
    ttl: 1000 * 60 * 60 * 24 * 30, //30 days
  },
  redirectTo: '/login',
  routes: {
    login: '/login',
    logout: '/logout'
  },
  cacheOn: true,
  cache: {
    segment: 'microauth-sessions',
    expiresIn: 1 * 60 * 60 * 1000, //1 hour
    staleIn: 5 * 60 * 1000, //5 minutes
    staleTimeout: 100,
    generateTimeout: 5000
  },
  strategy: {
    name: 'microauth',
    mode: true,
  }
};

exports.register = function(server, options, next) {
  const config = aug('defaults', defaults, options);

  if (!config.host) {
    return next(new Error('host must be set'));
  }
  if (!config.hostRedirect) {
    config.hostRedirect = config.host;
  }

  config.cache.generateFunc = (id, done) => {
    getMe.bind(config)(id, done);
  };
  const expose = {
    config,
    getMe: getMe.bind(config),
    getUser: getUser.bind(config),
    getTokenFromRequest: getTokenFromRequest.bind(config),
    setCookie: setCookie.bind(config)
  };
  if (config.cacheOn) {
    expose.userCache = server.cache(config.cache);
  }

  server.decorate('server', 'microauth', expose);

  server.auth.scheme('microauth', scheme.bind(config));

  if (config.strategy) {
    server.auth.strategy(config.strategy.name, 'microauth', config.strategy.mode, {});
  }

  if (config.routes) {
    routes(server, config);
  }
  next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
