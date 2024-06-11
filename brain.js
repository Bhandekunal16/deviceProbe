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
    ,
    driver.session(),
  ];
  const obj = await application(ip);
  const agent = useragent.parse(userAgentString);
  const deviceName = agent.device.toString();
  const params = new global().method(obj, requestData);
  session
    .writeTransaction((tx) => {
      return tx.run(new global().query, params);
    })
    .then(() => {
      session.close();
      res.send({ address: obj, deviceName: deviceName });
    })
    .catch((error) => {
      session.close();
      res.send(error);
    });
});

app.listen(3001, () => {
  new Logger().log("Server is running on port http://localhost:3001");
});
