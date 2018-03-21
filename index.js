const aug = require('aug');
const getMe = require('./lib/getMe');
const getUser = require('./lib/getUser');
const getTokenFromRequest = require('./lib/getTokenFromRequest');
const updateLastSessionDate = require('./lib/updateLastSessionDate');
const setCookie = require('./lib/setCookie');
const updateSettings = require('./lib/updateSettings');
const updateMeta = require('./lib/updateMeta');
const scheme = require('./lib/scheme');
const routes = require('./lib/routes');

const defaults = {
  verbose: false,
  host: '',
  hostRedirect: null,
  queryKey: 'token',
  cookie: {
    name: 'token',
    ttl: 1000 * 60 * 60 * 24 * 30, //30 days
  },
  redirectOnTry: true,
  redirectTo: false, // defaults to routes.login w/ host redirect
  routes: {
    login: '/login',
    logout: '/logout'
  },
  cacheEnabled: true,
  cache: {
    segment: 'microauth-sessions',
    expiresIn: 1 * 60 * 60 * 1000, //1 hour
    staleIn: 5 * 60 * 1000, //5 minutes
    staleTimeout: 100,
    generateTimeout: 5000
  },
  strategy: {
    name: 'microauth',
    mode: 'required'
  },
  noRedirect: false
};

exports.plugin = {
  register(server, options) {
    const config = aug(defaults, options);

    if (!config.host) {
      throw new Error('host must be set');
    }
    if (!config.hostRedirect) {
      config.hostRedirect = config.host;
    }

    config.cache.generateFunc = async (id, done) => {
      if (config.verbose) {
        server.log(['hapi-micro-auth', 'cache-miss'], `Fetching user ${id}`);
      }
      const user = await getMe.bind(config)(id);
      return user;
    };

    const expose = {
      updateMeta,
      updateSettings,
      updateLastSessionDate,
      config,
      getMe: getMe.bind(config),
      getUser: getUser.bind(config),
      getTokenFromRequest: getTokenFromRequest.bind(config),
      setCookie: setCookie.bind(config)
    };

    if (config.cacheEnabled) {
      expose.userCache = server.cache(config.cache);
    }

    server.decorate('server', 'microauth', expose);

    server.auth.scheme('microauth', scheme.bind(config));

    if (config.strategy) {
      server.auth.strategy(config.strategy.name, 'microauth');
      server.auth.default({ strategy: config.strategy.name, mode: config.strategy.mode });
    }

    if (config.routes) {
      routes(server, config);
    }
  },
  pkg: require('./package.json')
};
