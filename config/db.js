var mysql = require('mysql');

var connectionDB = mysql.createConnection({
  host: "bs3p4xguks7fdxaznsia-mysql.services.clever-cloud.com",
  user: "umedxafaihuq72ju",
  password: "umedxafaihuq72ju",
  database: "bs3p4xguks7fdxaznsia"
});

connectionDB.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

module.exports = connectionDB