const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
  "neo4j+s://b76e3d84.databases.neo4j.io:7687",
  neo4j.auth.basic("neo4j", "kH8WQkwu-vK5bmjUYjJ2oe1kbcBeoZdDeErj9o8woSk")
);

const session = driver.session();

class database {
    
  create(body, device) {
    

    session
      .run(query, params)
      .then((result) => {
        result.records.forEach((record) => {
          console.log(record.get("p").properties);
        });
      })
      .catch((error) => {
        console.error("Error running Cypher query:", error);
      })
      .finally(() => {
        session.close();
        driver.close();
      });
  }
}

module.exports = database;
