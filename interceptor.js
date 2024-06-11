const [db, Logger] = [
  require("roboticdb/src/brain"),
  require("robotic.js/src/interface/Logger"),
];
module.exports = function isLogger(req, res, next) {
  next(
    req.hostname == "localhost"
      ? new db().write(
          {
            url: req.url,
            method: req.method,
            host: req.hostname,
            body: req.body,
            hitOn: `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`,
          },
          "log"
        )
      : logRequest(req)
  );
};

logRequest = (req) => {
  new Logger().log(req.url),
    new Logger().log(req.method),
    new Logger().log(req.hostname),
    new Logger().log(req.body),
    new Logger().log(
      `${new Date().getDay()}/${new Date().getMonth()}/${new Date().getFullYear()}`
    );
};
