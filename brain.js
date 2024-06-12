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
  Config,
  exteroceptor,
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
  require("robotic-env-reader/index"),
  require("./interceptor"),
];

const app = express();
const route = ["", "/decrypt", "/get", "/", "/edit/portfolio"];
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

app.get(route[0], (req, res) => {
  res.send(`<h1>Hello world</h1>`);
});

app.post(route[1], async (req, res) => {
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

app.get(route[2], async (req, res) => {
  const [query, session] = [
    `MATCH (p:Person) RETURN COLLECT(properties(p)) as Person`,
    driver.session(),
  ];
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

app.post(route[3], async (req, res) => {
  const [ip, userAgentString, requestData, session] = [
    req.headers["x-forwarded-for"] || req.socket.remoteAddress,
    req.headers["user-agent"],
    req.body,
    driver.session(),
  ];
  const obj = await application(ip);
  const agent = useragent.parse(userAgentString);
  const os = agent.os ? agent.os.toString() : "not defined";
  const deviceName = agent.device ? agent.device.toString() : "not defined";
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

app.post(route[4], async (req, res) => {
  const session = driver.session();
  session
    .writeTransaction((tx) => {
      return tx
        .run(
          `create (p: profile {status : $status }) return collect(properties(p)) as User`,
          { status: req.body.status }
        )
        .then((result) => {
          console.log(result.records[0].get("User"));
          return result.records[0].get("User");
        });
    })
    .then(async () => {
      session.close();
      res.send("status updated successfully");
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.listen(3001, () => {
  new Logger().log(`Server is up and running at http://localhost:${3001}`);
  new Logger().array(route);
});
