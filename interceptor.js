const Logger = require("robotic.js/src/interface/Logger");
module.exports = function isLogger(req, res, next) {
  const array = {
    url: req.url,
    method: req.method,
    host: req.hostname,
    body: req.body,
    hitOn: `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
  };
  const query = Object.entries(array).map(([key, value]) => `${key}: ${value}`);

  next(new Logger().array(query));
};
