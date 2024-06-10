const [App, express, cors, bodyParser, useragent, neo4j, Logger] = [
  require("./app"),
  require("express"),
  require("cors"),
  require("body-parser"),
  require("useragent"),
  require("neo4j-driver"),
  require("robotic.js/src/interface/Logger"),
];

const app = express();
const driver = neo4j.driver(
  "neo4j+s://b76e3d84.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "kH8WQkwu-vK5bmjUYjJ2oe1kbcBeoZdDeErj9o8woSk")
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
        const data = result.records[0].get("Person");
        return data;
      });
    })
    .then((data) => {
      session.close();
      res.send({ data: data });
    })
    .catch((error) => {
      console.error("Error running Cypher query:", error);
      session.close();
      res.status(500).send("Internal server error");
    });
});

app.post("/", async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgentString = req.headers["user-agent"];
  const agent = useragent.parse(userAgentString);
  const deviceName = agent.device.toString();

  const requestData = req.body;
  const obj = await application(ip);

  const query = `
    MERGE (p:Person { deviceName: $deviceName, country: $country,
      country_name: $country_name,
      country_code: $country_code,
      country_code_iso3: $country_code_iso3,
      country_capital: $country_capital,
      country_tld: $country_tld,
      continent_code: $continent_code,
      in_eu: false,
      postal: $postal,
      latitude: $latitude,
      longitude: $longitude,
      timezone: $timezone,
      utc_offset: $utc_offset,
      country_calling_code: $country_calling_code,
      currency: $currency,
      currency_name: $currency_name,
      languages: $languages,
      country_area: $country_area,
      country_population: $country_population,
      asn: $asn,
      org: $org,
      ip: $ip,
      network: $network, 
      version: $version, 
      city: $city, 
      region: $region, 
      region_code: $region_code,
      deviceLatitude: $deviceLatitude,
      deviceLongitude: $deviceLongitude 
    }) 
    RETURN p`;

  const params = {
    ip: obj.ip,
    network: obj.network,
    version: obj.version,
    city: obj.city,
    region: obj.region,
    region_code: obj.region_code,
    country: obj.country,
    country_name: obj.country_name,
    country_code: obj.country_code,
    country_code_iso3: obj.country_code_iso3,
    country_capital: obj.country_capital,
    country_tld: obj.country_tld,
    continent_code: obj.continent_code,
    in_eu: false,
    postal: obj.postal,
    latitude: obj.latitude,
    longitude: obj.longitude,
    timezone: obj.timezone,
    utc_offset: obj.utc_offset,
    country_calling_code: obj.country_calling_code,
    currency: obj.currency,
    currency_name: obj.currency_name,
    languages: obj.languages,
    country_area: obj.country_area,
    country_population: obj.country_population,
    asn: obj.asn,
    org: obj.org,
    deviceName: deviceName,
    deviceLatitude: requestData.deviceLatitude,
    deviceLongitude: requestData.deviceLongitude,
  };

  const session = driver.session();

  session
    .writeTransaction((tx) => {
      return tx.run(query, params).then((result) => {
        result.records.forEach((record) => {
          console.log(record.get("p").properties);
        });
        console.log(result);
      });
    })
    .then(() => {
      session.close();
      res.send({ address: obj, deviceName: deviceName });
    })
    .catch((error) => {
      console.error("Error running Cypher query:", error);
      session.close();
      res.status(500).send("Internal server error");
    });
});

app.listen(3001, () => {
  new Logger().log("Server is running on port http://localhost:3001");
});
