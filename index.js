const express = require('express');
const { setEnv } = require('./lib/utils')();
const libRoute = require('./lib/route');
const log = require('debug')('r2:resize');

module.exports = function Resize(app, conf) {
  const getConfig = conf || app.config('resize');
  if (!getConfig) {
    return log('resize config not found!');
  }

  const {
    target = 'local',
    cacheDev = true,
    quality = 100,
    cacheFileDir,
  } = getConfig;

  const targetConf = getConfig[target] || app.config(target);
  if (!targetConf) {
    return log('resize target config not found!');
  }

  setEnv('DEFAULT_SOURCE', target);
  setEnv('CACHE_DEV_REQUESTS', cacheDev);
  setEnv('IMAGE_QUALITY', quality);

  if (cacheFileDir) {
    setEnv('CACHE_FILE_DIRECTORY', cacheFileDir);
  }

  if (target === 'local') {
    setEnv('LOCAL_FILE_PATH', targetConf.path || `${process.cwd()}/public`);
  } else if (target === 's3') {
    const { key, secret, bucket } = targetConf;
    setEnv('AWS_ACCESS_KEY_ID', key);
    setEnv('AWS_SECRET_ACCESS_KEY', secret);
    setEnv('S3_BUCKET', bucket);
  }

  const router = express.Router();
  router.get('*', libRoute(app, getConfig));
  app.use('/_i', router);
};
