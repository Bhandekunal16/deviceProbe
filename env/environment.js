class environment {
  connection;
  name;
  password;
  port;
  publicKey;

  constructor(){
    this.connection = "neo4j+s://081cb2b7.databases.neo4j.io:7687";
    this.name = "neo4j";
    this.password = "d_LAvW1ju0zt015QFi_16YlFzQ16oRch3bfLDdjZlxc";
    this.port = 3001;
    this.publicKey = "robotic.js";
  }

  
}

module.exports = environment;
