const { getDefaultConfig } = require('expo/metro-config');
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = getDefaultConfig(__dirname);

config.server = {
  ...config.server,
  enhanceMiddleware: (middleware, server) => {
    return (req, res, next) => {
      if (req.url.startsWith('/api-proxy')) {
        const targetUrl = 'https://gacha-travel--s8869420.replit.app' + req.url.replace('/api-proxy', '');
        
        const proxyMiddleware = createProxyMiddleware({
          target: 'https://gacha-travel--s8869420.replit.app',
          changeOrigin: true,
          pathRewrite: {
            '^/api-proxy': '',
          },
          secure: true,
          onProxyRes: (proxyRes, req, res) => {
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          },
        });
        
        return proxyMiddleware(req, res, next);
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
