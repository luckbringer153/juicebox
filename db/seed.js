//seed file will call utility functions from index.js file
//"seeding" = double-checking; making sure we have correct definitions in tables, no unwanted data, etc

// grab our client with destructuring from the export in index.js
const { client, getAllUsers, createUser } = require("./index");

// this function should call a query which drops all tables from our database
async function dropTables() {
  try {
    console.log("Starting to drop tables...");

    await client.query(`
    DROP TABLE IF EXISTS users;
    `);

    console.log("Finished dropping tables");
  } catch (error) {
    console.error("Error dropping tables");
    throw error; // we pass the error up to the function that calls dropTables
  }
}

// this function should call a query which creates all tables for our database
async function createTables() {
  try {
    console.log("Starting to build tables...");

    await client.query(`
CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL
      );
    `);

    console.log("Finished building tables!");
  } catch (error) {
    console.error("Error building tables!");
    throw error; // we pass the error up to the function that calls createTables
  }
}

// new function, should attempt to create a few users
async function createInitialUsers() {
  try {
    console.log("Starting to create users...");

    const albert = await createUser({
      username: "sandra",
      password: "glamgal",
    });

    console.log(albert);

    console.log("Finished creating users!");
  } catch (error) {
    console.error("Error creating users!");
    throw error;
  }
}

async function rebuildDB() {
  try {
    // connect the client to the database, finally
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();

    // const { rows } = await client.query(`SELECT * FROM users;`);
    // console.log(rows);

    // queries are promises, so we can await them
    // const result = await client.query(`SELECT * FROM users;`);

    // // for now, logging is a fine way to see what's up
    // console.log(result);
  } catch (error) {
    console.error(error);
  }
}

async function testDB() {
  try {
    console.log("Starting to test database...");

    const users = await getAllUsers();
    console.log("getAllUsers:", users);

    console.log("Finished database tests!");
  } catch (error) {
    console.error("Error testing database!");
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());