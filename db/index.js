// this file will provide the utility functions the rest of our application will use; they'll be called by the seed file and the main application file

const { Client } = require("pg"); // imports the pg module

const client = new Client("postgres://localhost:5432/juicebox-dev");

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username 
    FROM users;
  `
  );

  return rows;
}

async function createUser({ username, password }) {
  try {
    const { rows } = await client.query(`
INSERT INTO users(username, password)
      VALUES ($1, $2) ON CONFLICT (username) DO NOTHING 
      RETURNING *;;
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  createUser,
};
