const Ziggy = {
  url: 'http:\/\/localhost:8000',
  port: 8000,
  defaults: {},
  routes: {
    'boost.browser-logs': { uri: '_boost\/browser-logs', methods: ['POST'] },
    home: { uri: '\/', methods: ['GET', 'HEAD'] },
    'auth.login.create': { uri: 'auth\/login', methods: ['GET', 'HEAD'] },
    'auth.login': { uri: 'auth\/login', methods: ['POST'] },
    'auth.otp.create': { uri: 'auth\/verify-otp', methods: ['GET', 'HEAD'] },
    'auth.otp.verify': { uri: 'auth\/verify-otp', methods: ['POST'] },
    dashboard: { uri: 'dashboard', methods: ['GET', 'HEAD'] },
    'auth.logout': { uri: 'auth\/logout', methods: ['POST'] },
    'storage.local': { uri: 'storage\/{path}', methods: ['GET', 'HEAD'], wheres: { path: '.*' }, parameters: ['path'] },
    'storage.local.upload': { uri: 'storage\/{path}', methods: ['PUT'], wheres: { path: '.*' }, parameters: ['path'] },
  },
};
if (typeof window !== 'undefined' && typeof window.Ziggy !== 'undefined') {
  Object.assign(Ziggy.routes, window.Ziggy.routes);
}
export { Ziggy };
