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
];

const app = express();
const driver = neo4j.driver(
  new environment().connection,
  neo4j.auth.basic(new environment().name, new environment().password)
);

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

async function application(ip) {
  return await App.infoPrinter(ip);
}

app.get("/get", async (req, res) => {
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
    .then((data) => {
      session.close();
      res.send({ data: data });
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.post("/", async (req, res) => {
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
    .then(() => {
      session.close();
      const encryptionData = new encryption().encrypt({
        address: obj,
        deviceName: deviceName,
      });
      res.send({
        address: obj,
        deviceName: deviceName,
        encryptionData: encryptionData,
      });
    })
    .catch((error) => {
      session.close();
      console.log(error);
      res.send(error);
    });
});

app.listen(3001, () => {
  new Logger().log("Server is running on port http://localhost:3001");
});
