var mysql = require('mysql');

var connectionDB = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "auth"
});

connectionDB.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = connectionDB