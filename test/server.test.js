const Lab = require('lab');
const lab = exports.lab = Lab.script();
const code = require('code');

const Hapi = require('hapi');

lab.experiment('server actions', () => {
  let authServer;

  lab.before(async() => {
    authServer = new Hapi.Server({ port: 8081 });
    authServer.route({
      path: '/api/me/{token}',
      method: 'get',
      handler(r, h) {
        code.expect(r.params.token).to.equal('aToken');
        return { _id: '1234' };
      }
    });

    authServer.route({
      path: '/api/users/{token}',
      method: 'get',
      handler(r, h) {
        code.expect(r.params.token).to.equal('anotherToken');
        return { _id: '5678' };
      }
    });

    authServer.route({
      path: '/api/users',
      method: 'put',
      handler(r, h) {
        code.expect(r.payload.token).to.equal('aToken');
        const result = Object.assign({}, r.payload);
        result._id = '5678';
        return result;
      }
    });

    authServer.route({
      path: '/api/users/meta',
      method: 'put',
      handler(r, h) {
        code.expect(r.query.token).to.equal('anotherToken');
        code.expect(r.payload.meta1).to.equal('metatron');
        return { _id: '5678' };
      }
    });

    authServer.route({
      path: '/api/users/settings',
      method: 'put',
      handler(r, h) {
        code.expect(r.query.token).to.equal('anotherToken');
        code.expect(r.payload.meta1).to.equal('setatron');
        return { _id: '5678' };
      }
    });

    await authServer.start();
  });
  lab.after(async() => {
    await authServer.stop();
  });

  lab.test('it should protect routes', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081'
      }
    });

    server.route({
      path: '/main',
      method: 'get',
      handler(r, h) {
        code.fail('this should be protected');
        return 'nothing here';
      }
    });

    server.route({
      path: '/main-two',
      method: 'get',
      handler(r, h) {
        return 'it is okay';
      }
    });

    await server.start();

    const result = await server.inject({ url: '/main' });
    code.expect(result.statusCode).to.equal(302);

    const resultTwo = await server.inject({ url: '/main-two?token=aToken' });
    code.expect(resultTwo.statusCode).to.equal(200);

    await server.stop();
  });

  lab.test('it should protect routes without cache enabled', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });

    server.route({
      path: '/main',
      method: 'get',
      handler(r, h) {
        code.fail('this should be protected');
        return 'nothing here';
      }
    });

    server.route({
      path: '/main-two',
      method: 'get',
      handler(r, h) {
        return 'it is okay';
      }
    });

    await server.start();

    const result = await server.inject({ url: '/main' });
    code.expect(result.statusCode).to.equal(302);

    const resultTwo = await server.inject({ url: '/main-two?token=aToken' });
    code.expect(resultTwo.statusCode).to.equal(200);

    await server.stop();
  });

  lab.test('it should support try mode', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        redirectTo: '/test',
        redirectOnTry: false,
        strategy: {
          name: 'micro-auth',
          mode: 'try'
        }
      }
    });

    server.route({
      path: '/main',
      method: 'get',
      handler(request, h) {
        // console.log(request.auth);
        code.expect(request.auth.isAuthorized).to.be.false();
        return 'Hi There';
      }
    });

    await server.start();

    const result = await server.inject({ url: '/main' });
    code.expect(result.statusCode).to.equal(200);

    await server.stop();
  });

  lab.test('it should provide getMe function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });

    const user = await server.microauth.getMe('aToken');
    code.expect(user._id).to.equal('1234');
  });

  lab.test('it should provide getUser function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });

    const user = await server.microauth.getUser('anotherToken');
    code.expect(user._id).to.equal('5678');
  });

  lab.test('it should provide getTokenFromRequest function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });

    const token = server.microauth.getTokenFromRequest({
      query: {
        token: 'token1'
      },
      state: {
        cookie: 'cookie'
      }
    });
    code.expect(token).to.equal('token1');
  });

  lab.test('it should support setCookie', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        redirectTo: '/test'
      }
    });

    await server.start();

    server.microauth.setCookie({
      state(cookieName, token, cache) {
        code.expect(cookieName).to.equal('token');
        code.expect(token).to.equal('broken');
        code.expect(cache.ttl).to.equal(2592000000);
      }
    }, 'broken');

    await server.stop();
  });

  lab.test('it should support redirectTo', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        redirectTo: '/test'
      }
    });

    server.route({
      path: '/main',
      method: 'get',
      handler(r, h) {
        code.fail('this should be protected');
        return 'nothing here';
      }
    });

    await server.start();

    const result = await server.inject({ url: '/main' });
    code.expect(result.statusCode).to.equal(302);
    code.expect(result.headers.location).to.equal('/test?next=%2Fmain');

    await server.stop();
  });

  lab.test('it should support noRedirect', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        noRedirect: true
      }
    });

    server.route({
      path: '/main',
      method: 'get',
      handler(r, h) {
        code.fail('this should be protected');
        return 'nothing here';
      }
    });

    await server.start();

    const result = await server.inject({ url: '/main' });
    code.expect(result.statusCode).to.equal(401);

    await server.stop();
  });

  lab.test('it should provide updateMeta function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });
    const result = await server.microauth.updateMeta('anotherToken', { meta1: 'metatron' });
    code.expect(result._id).to.equal('5678');
  });

  lab.test('it should provide updateMeta function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });
    const result = await server.microauth.updateSettings('anotherToken', { meta1: 'setatron' });
    code.expect(result._id).to.equal('5678');
  });

  lab.test('it should provide updateLastSessionDate function', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        routes: true,
        cacheEnabled: false
      }
    });
    const result = await server.microauth.updateLastSessionDate('aToken', 'Wonder Woman/X-Men 1.0');
    code.expect(result.userAgent).to.equal('Wonder Woman/X-Men 1.0');
    code.expect(result.incSessions).to.equal(1);
    code.expect(result._id).to.equal('5678');
  });

  lab.test('it should provide a hook route', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        cacheEnabled: false
      }
    });
    server.events.on('microauth.user.register', (payload) => {
      code.expect(payload).to.equal({
        event: 'user.register',
        userId: 777,
        moreData: 'sure'
      });
    });

    const result = await server.inject({
      method: 'post',
      url: '/auth-hook',
      payload: {
        event: 'user.register',
        userId: 777,
        moreData: 'sure'
      }
    });
    code.expect(result.statusCode).to.equal(200);
  });

  lab.test('it should be able to protect a hook route', async() => {
    const server = new Hapi.Server({ port: 8082, debug: { log: ['*'] } });
    await server.register({
      plugin: require('../'),
      options: {
        host: 'http://localhost:8081',
        hookSecret: '7823478234243',
        cacheEnabled: false
      }
    });

    const result = await server.inject({
      method: 'post',
      url: '/auth-hook',
      payload: {
        event: 'user.register',
        userId: 777,
        moreData: 'sure'
      }
    });
    code.expect(result.statusCode).to.equal(401);

    const result2 = await server.inject({
      method: 'post',
      url: '/auth-hook?secret=7823478234243',
      payload: {
        event: 'user.register',
        userId: 888
      }
    });
    code.expect(result2.statusCode).to.equal(200);
  });
});
