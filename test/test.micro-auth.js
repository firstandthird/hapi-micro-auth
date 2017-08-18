const tap = require('tap');
const async = require('async');
const Hapi = require('hapi');
const plugin = require('../index.js');

tap.test('registers the plugin', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'localhost:8080',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.start(() => {
        return done(null, register);
      });
    },
    verify(server, done) {
      t.equal(typeof server.microauth, 'object');
      t.equal(typeof server.microauth.getMe, 'function', 'getMe');
      t.equal(typeof server.microauth.getUser, 'function', 'getUser');
      t.equal(typeof server.microauth.setCookie, 'function', 'setCookie');
      t.equal(typeof server.microauth.getTokenFromRequest, 'function', 'getTokenFromRequest');
      t.equal(typeof server.microauth.userCache, 'object', 'userCache');
      done();
    },
    stop(server, verify, done) {
      server.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('protects route from invalid login', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8081',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.route({
        path: '/main',
        method: 'get',
        handler(request, reply) {
          // this should not be called:
          t.fail();
        }
      });
      register.route({
        path: '/main2',
        method: 'get',
        handler(request, reply) {
          // this should be called:
          reply(null, 'it is okay');
        }
      });
      register.start(() => {
        return done(null, register);
      });
    },
    testServer(done) {
      const testServer = new Hapi.Server();
      testServer.connection({
        host: 'localhost',
        port: 8081
      });
      testServer.route({
        path: '/api/me/{token}',
        method: 'get',
        handler(request, reply) {
          t.equal(request.params.token, 'aToken', 'token passed to /api/me matches');
          return reply(null, { _id: '1234' });
        }
      });
      testServer.start(() => done(null, testServer));
    },
    getMain(server, testServer, done) {
      server.inject({
        url: '/main',
        method: 'get',
      }, (response) => {
        return done(null, response);
      });
    },
    getMain2(server, testServer, done) {
      server.inject({
        url: '/main2?token=aToken',
        method: 'get',
      }, (response) => {
        done(null, response);
      });
    },
    verify(getMain, getMain2, done) {
      t.equal(getMain.statusCode, 302, 'redirects when route accessed without credentials');
      t.equal(getMain2.statusCode, 200, 'permits access with credentials');
      done();
    },
    stop(server, verify, done) {
      server.stop(done);
    },
    stopTest(testServer, verify, done) {
      testServer.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('supports turning off cache with cacheOn', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8081',
          routes: true,
          cacheOn: false
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.route({
        path: '/main',
        method: 'get',
        handler(request, reply) {
          // this should not be called:
          t.fail();
        }
      });
      register.route({
        path: '/main2',
        method: 'get',
        handler(request, reply) {
          // this should be called:
          reply(null, 'it is okay');
        }
      });
      register.start(() => {
        return done(null, register);
      });
    },
    testServer(done) {
      const testServer = new Hapi.Server();
      testServer.connection({
        host: 'localhost',
        port: 8081
      });
      testServer.route({
        path: '/api/me/{token}',
        method: 'get',
        handler(request, reply) {
          t.equal(request.params.token, 'aToken', 'token passed to /api/me matches');
          return reply(null, { _id: '1234' });
        }
      });
      testServer.start(() => done(null, testServer));
    },
    getMain(server, testServer, done) {
      server.inject({
        url: '/main',
        method: 'get',
      }, (response) => {
        return done(null, response);
      });
    },
    getMain2(server, testServer, done) {
      server.inject({
        url: '/main2?token=aToken',
        method: 'get',
      }, (response) => {
        done(null, response);
      });
    },
    verify(getMain, getMain2, done) {
      t.equal(getMain.statusCode, 302, 'redirects when route accessed without credentials');
      t.equal(getMain2.statusCode, 200, 'permits access with credentials');
      done();
    },
    stop(server, verify, done) {
      server.stop(done);
    },
    stopTest(testServer, verify, done) {
      testServer.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('plugin provides getMe ', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8081',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.start(() => {
        return done(null, register);
      });
    },
    testServer(done) {
      const testServer = new Hapi.Server();
      testServer.connection({
        host: 'localhost',
        port: 8081
      });
      testServer.route({
        path: '/api/me/{token}',
        method: 'get',
        handler(request, reply) {
          t.equal(request.params.token, 'aToken', 'token passed to /api/me matches');
          return reply({ _id: '1234' });
        }
      });
      testServer.start(() => done(null, testServer));
    },
    getMe(testServer, server, done) {
      server.microauth.getMe('aToken', done);
    },
    verify(getMe, done) {
      t.equal(getMe._id, '1234', 'returns the correct user for a given token');
      done();
    },
    stop(server, verify, done) {
      server.stop(done);
    },
    stopTest(testServer, verify, done) {
      testServer.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('plugin provides getUser ', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8081',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.start(() => {
        return done(null, register);
      });
    },
    testServer(done) {
      const testServer = new Hapi.Server();
      testServer.connection({
        host: 'localhost',
        port: 8081
      });
      testServer.route({
        path: '/api/users/{token}',
        method: 'get',
        handler(request, reply) {
          t.equal(request.params.token, 'aToken', 'token passed to /api/users matches');
          return reply(null, { _id: '1234' });
        }
      });
      testServer.start(() => done(null, testServer));
    },
    getUser(server, testServer, done) {
      server.microauth.getUser('aToken', done);
    },
    verify(getUser, done) {
      t.equal(getUser._id, '1234', 'gets a user from a micro-auth server');
      done();
    },
    stop(server, verify, done) {
      server.stop(done);
    },
    stopTest(testServer, verify, done) {
      testServer.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('plugin provides getTokenFromRequest ', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8080',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.route({
        path: '/api/user/{token}',
        method: 'get',
        handler(request, reply) {
          t.equal(request.params.token, 'aToken', 'token passed to /api/me matches');
          return reply(null, 'hi there');
        }
      });
      register.start(() => done(null, register));
    },
    getTokenFromRequestQuery(server, done) {
      const cookieToken = server.microauth.getTokenFromRequest({
        query: {
          token: 'token1'
        },
        state: {
          cookie: 'cookie'
        }
      });
      t.equal(cookieToken, 'token1', 'can get token from request query');
      done();
    },
    getTokenFromRequestCookie(server, done) {
      const cookieToken = server.microauth.getTokenFromRequest({
        query: {},
        state: {
          token: 'croakin`'
        }
      });
      t.equal(cookieToken, 'croakin`', 'can get token from request cookie');
      done();
    },
    stop(server, getTokenFromRequestCookie, getTokenFromRequestQuery, done) {
      server.stop(done);
    }
  }, (err) => {
    t.end();
  });
});

tap.test('plugin provides setCookie ', (t) => {
  async.autoInject({
    init(done) {
      const init = new Hapi.Server();
      init.connection({
        host: 'localhost',
        port: 8080
      });
      return done(null, init);
    },
    register(init, done) {
      init.register({
        register: plugin,
        options: {
          host: 'http://localhost:8080',
          routes: true
        }
      }, (err) => {
        if (err) {
          console.log(err);
        }
        return done(err, init);
      });
    },
    server(register, done) {
      register.start(() => {
        return done(null, register);
      });
    },
    setCookie(server, done) {
      server.microauth.setCookie({
        state(cookieName, token, cache) {
          t.equal(cookieName, 'token', 'sets cookie name correctly');
          t.equal(token, 'broken', 'sets cookie value correctly');
          t.equal(cache.ttl, 2592000000, 'sets cookie ttl correctly');
          done();
        } }, 'broken');
    },
    stop(server, setCookie, done) {
      server.stop(done);
    }
  }, (err) => {
    t.end();
  });
});
