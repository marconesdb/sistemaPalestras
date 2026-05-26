const mysql = require("mysql2/promise");

const conexao = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "palestras"
});

module.exports = conexao;