const Pool = require("pg").Pool

const pool = new Pool({
    user: "postgres",
    password: "H?8v#2&b9CvyEcn",
    database: "mblock_api_db",
    // host: "localhost",
    host: "postgresqls",
    port: 5432
});

module.exports = pool;