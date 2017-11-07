module.exports = () => (
  {
    setEnv(key, value) {
      process.env[key] = value;
    },

    notFound(res) {
      res.status(404).end();
    },
  }
);
