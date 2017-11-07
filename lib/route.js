const parseDomain = require('parse-domain');
const { notFound } = require('./utils')();
const log = require('debug')('r2:resize');

module.exports = (app, conf) => {
  const { target = 'local', host = {} } = conf;
  const resizer = require('image-resizer'); // eslint-disable-line
  const Img = resizer.img;
  const streams = resizer.streams;

  return (req, res) => {
    if (req.path.length <= 1) {
      log('improper url %s', req.path);
      return notFound(res);
    }

    const segments = req.path.split('/');
    const size = segments[1];
    const { domain } = parseDomain(req.hostname) || {};
    const hostname = domain || req.hostname;

    if (app.get('env') === 'development') {
      log('allowed for development %s', req.url);
    } else if (!host[hostname]) {
      log('not found hostname!', hostname);
      return notFound(res);
    } else if (!host[hostname].includes(size)) {
      log('not allowed image size!', size);
      return notFound(res);
    }

    log(`from ${target} %s`, req.path);
    const {
      identify: Identify, resize: Resize, filter: Filter, optimize: Optimize,
    } = streams;

    const image = new Img(req, res);
    return image.getFile()
      .pipe(new Identify())
      .pipe(new Resize())
      .pipe(new Filter())
      .pipe(new Optimize())
      .pipe(streams.response(req, res));
  };
};
