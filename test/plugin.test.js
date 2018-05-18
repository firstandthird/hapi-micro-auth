'use strict';

const Lab = require('lab');
const lab = exports.lab = Lab.script();
const code = require('code');

const Hapi = require('hapi');

lab.experiment('plugin registration', () => {
  lab.test('it should register if passed valid options', async() => {
    const server = new Hapi.Server();
    try {
      await server.register({
        plugin: require('../'),
        options: {
          host: 'http://localhost:8081/auth',
          routes: true
        }
      });
    } catch (e) {
      code.fail('Registration should not fail.');
    }
    code.expect(server.microauth).to.be.an.object();
    code.expect(server.microauth.getMe).to.be.a.function();
    code.expect(server.microauth.getUser).to.be.a.function();
    code.expect(server.microauth.setCookie).to.be.a.function();
    code.expect(server.microauth.updateLastSessionDate).to.be.a.function();
    code.expect(server.microauth.updateMeta).to.be.a.function();
    code.expect(server.microauth.updateSettings).to.be.a.function();
    code.expect(server.microauth.getTokenFromRequest).to.be.a.function();
    code.expect(server.microauth.userCache).to.be.an.object();
  });

  lab.test('it should throw an error if host is not set', async() => {
    const server = new Hapi.Server();
    await code.expect(server.register(require('../'))).to.reject();
  });
});
