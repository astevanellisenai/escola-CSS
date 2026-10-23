import pkg from 'pg';
const { Pool } = pkg;

const BD = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: '_2025_escola2',
  password: 'admin',
  port: 5432
});

export default BD;
