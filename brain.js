const [
  App,
  express,
  cors,
  bodyParser,
  useragent,
  neo4j,
  Logger,
  global,
  environment,
  encryption,
  exteroceptor,
  Route,
  response,
] = [
  require("./app"),
  require("express"),
  require("cors"),
  require("body-parser"),
  require("useragent"),
  require("neo4j-driver"),
  require("robotic.js/src/interface/Logger"),
  require("./global/global"),
  require("./env/environment"),
  require("robotic-authenticator/src/algorithm"),
  require("./interceptor"),
  require("./global/route"),
  require("./global/response"),
];

const app = express();
const driver = neo4j.driver(
  new environment().connection,
  neo4j.auth.basic(new environment().name, new environment().password)
);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(exteroceptor);

async function application(ip) {
  return await App.infoPrinter(ip);
}

app.get(new Route().route[0], (req, res) => {
  res.send(new global().serverChecker);
});

app.post(new Route().route[1], async (req, res) => {
  try {
    const encryptionData = await new encryption().decrypt(
      req.body.key,
      req.body.data
    );
    res.send(JSON.parse(encryptionData.decrypted));
  } catch (error) {
    res.send(error);
  }
});

app.get(new Route().route[2], async (req, res) => {
  const [query, session] = [new global().matchPerson, driver.session()];
  session
    .readTransaction((tx) => {
      return tx.run(query).then((result) => {
        return result.records[0].get("Person");
      });
    })
    .then(async (data) => {
      session.close();
      const encryptionData = await new encryption().encrypt(
        "robotic.js",
        JSON.stringify({
          data: data,
        })
      );
      res.send(encryptionData);
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.post(new Route().route[3], async (req, res) => {
  const [ip, userAgentString, requestData, session] = [
    req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    req.headers["user-agent"],
    req.body,
    driver.session(),
  ];
  const obj = await application(ip);
  const agent = useragent.parse(userAgentString);
  const os = agent.os ? agent.os.toString() : new response().notDefined;
  const deviceName = agent.device
    ? agent.device.toString()
    : new response().notDefined;
  const params = new global().method(obj, requestData, deviceName, os);
  session
    .writeTransaction((tx) => {
      return tx.run(new global().query, params);
    })
    .then(async () => {
      session.close();
      const encryptionData = await new encryption().encrypt(
        "robotic.js",
        JSON.stringify({
          address: obj,
          deviceName: deviceName,
        })
      );

      res.send(encryptionData);
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.post(new Route().route[4], async (req, res) => {
  const session = driver.session();
  session
    .writeTransaction((tx) => {
      return tx.run(new global().editProfile, { status: req.body.status });
    })
    .then(async () => {
      session.close();
      res.send({ status: true, msg: new response().statusUpdated });
    })
    .catch((error) => {
      session.close();
      console.log(error);
      res.send(error);
    });
});

app.get(new Route().route[5], async (req, res) => {
  const [query, session] = [new global().matchProfile, driver.session()];
  session
    .readTransaction((tx) => {
      return tx.run(query).then((result) => {
        return result.records[0].get("Person");
      });
    })
    .then(async (data) => {
      session.close();
      const encryptionData = await new encryption().encrypt(
        "robotic.js",
        JSON.stringify({
          data: data,
        })
      );
      res.send(encryptionData);
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.listen(new environment().port, () => {
  new Logger().log(new global().serverGrating(new environment().port));
  new Logger().array(new Route().route);
});
