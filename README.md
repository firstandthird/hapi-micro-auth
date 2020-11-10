<h1 align="center">hapi-micro-auth</h1>

<p align="center">
  <a href="https://github.com/firstandthird/hapi-micro-auth/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/hapi-micro-auth/Test/main?label=Tests&style=for-the-badge" alt="Test Status"/>
  </a>
  <a href="https://github.com/firstandthird/hapi-micro-auth/actions">
    <img src="https://img.shields.io/github/workflow/status/firstandthird/hapi-micro-auth/Lint/main?label=Lint&style=for-the-badge" alt="Lint Status"/>
  </a>
</p>

Hapi plugin to expose [micro-auth](https://github.com/firstandthird/micro-auth) as an auth provider.


## Installation

```sh
npm install hapi-micro-auth
```

_or_

```sh
yarn add hapi-micro-auth
```


## Usage

In your server setup code:

```javascript
await server.register({
  plugin: require('../'),
  options: {
    host: 'http://localhost:8081/auth', // URL to micro-auth
    routes: true
  }
});
```

In rapptor:

```yaml
plugins:
  hapi-micro-auth:
    verbose: true
    host: '{{urls.auth.endpoint}}'
    hostRedirect: '{{urls.auth.redirect}}'
    cacheEnabled: false
    redirectTo: '/login'
    redirectOnTry: false
    routes:
      login: false
      logout: '/logout'
    cookie:
      name: 'auth'
      isSecure: false
      ttl: 12960000000
      clearInvalid: true
    strategy:
      name: 'microauth'
      mode: 'try'
```


## Plugin Configuration

The following options are available:

```javascript
const defaults = {
  verbose: false,
  host: '',
  hostRedirect: null,
  queryKey: 'token',
  cookie: {
    name: 'token',
    isSecure: false,
    ttl: 1000 * 60 * 60 * 24 * 30, //30 days
    clearInvalid: false
  },
  trackLastSession: true,
  sessionDateCookie: {
    name: 'lastSessionDateSet',
    ttl: null,
    isSecure: false,
    isSameSite: 'Lax'
  },
  redirectOnTry: true,
  redirectTo: false, // defaults to routes.login w/ host redirect
  routes: {
    login: '/login',
    logout: '/logout',
    hook: '/auth-hook'
  },
  hookSecret: false,
  hookEventNamespace: 'microauth',
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
  noRedirect: false,
  setDefault: true
};
```


## Methods

All methods are accessible from `server.microauth`

### _async_ __`getMe(token)`__

Takes a user token and returns a user object or `Boom.notFound()`.

_Note: This is slightly different from `getUser` in that it calls the `/me` api endpoint which returns different information which isn't suitable for use when grabbing information for public display._

### __`getTokenFromRequest(request)`__

Returns a token from a request.

### _async_ __`getUser(token)`__

Takes a user token and returns a user object or `Boom.notFound()`.

### _async_ __`list(query)`__

Returns a list of users matching the supplied query. See the micro-auth docs for query params.

### _async_ __`updateLastSessionDate(token, userAgent)`__

This is called automatically if set in options.

### _async_ __`updateMeta(token, newMetadata)`__

Updates a user's meta object with the supplied `newMetadata`.

### _async_ __`updateSettings(token, newSettings)`__

Updates a user's settings object with the supplied `newSettings`.

---

<a href="https://firstandthird.com"><img src="https://firstandthird.com/_static/ui/images/safari-pinned-tab-62813db097.svg" height="32" width="32" align="right"></a>

_A [First + Third](https://firstandthird.com) Project_
