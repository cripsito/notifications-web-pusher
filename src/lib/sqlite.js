/**
 * Module handles database management
 *
 * Server API calls the methods in here to query and update the SQLite database
 */

// Utilities we need
import fs from 'fs';
import sql3, { Database } from 'sqlite3';
const sqlite3 = sql3;
import { open } from 'sqlite';
//const fs = require('fs');

// Initialize the database
const dbFile = '../../subscriptionsdb2.db';
const exists = fs.existsSync(dbFile);
//const sqlite3 = require('sqlite3').verbose();
//const dbWrapper = require('sqlite');

let db = undefined;
let dbret = {};

/* 
We're using the sqlite wrapper so that we can make async / await connections
- https://www.npmjs.com/package/sqlite
*/

open({
  filename: dbFile,
  driver: sqlite3.Database,
})
  .then(async (dBase) => {
    db = dBase;
    // We use try and catch blocks throughout to handle any database errors
    try {
      // The async / await syntax lets us write the db operations in a way that won't block the app
      if (!exists) {
        console.error('creamos db');
        // Database doesn't exist yet - create Choices and Log tables
        await dBase.run(
          'CREATE TABLE Subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)'
        );

        // Add default choices to table
        /* await db.run(
          "INSERT INTO Subscriptions (language, picks) VALUES ('HTML', 0), ('JavaScript', 0), ('CSS', 0)"
        ); */

        // Log can start empty - we'll insert a new record whenever the user chooses a poll option
        await dBase.run(
          'CREATE TABLE Log (id INTEGER PRIMARY KEY AUTOINCREMENT, choice TEXT, time STRING)'
        );
      } else {
        console.error('existe db');
        // We have a database already - write Choices records to log for info
        //console.log(await dBase.all('SELECT * from Subscriptions'));

        //If you need to remove a table from the database use this syntax
        //db.run("DROP TABLE Logs"); //will fail if the table doesn't exist
      }
    } catch (dbError) {
      console.error('no se pudo crear db');
      console.error(dbError);
    }
  })
  .catch((e) => {
    console.error('no puede leer');
    console.error(e);
  });

// Our server script will call these methods to connect to the db

/**
 * Get the options in the database
 *
 * Return everything in the Choices table
 * Throw an error in case of db connection issues
 */
dbret.getOptions = async () => {
  // We use a try catch block in case of db errors
  try {
    return await db.all('SELECT * from Subscriptions');
  } catch (dbError) {
    // Database connection error
    console.error(dbError);
  }
};

/**
 * Process a user vote
 *
 * Receive the user vote string from server
 * Add a log entry
 * Find and update the chosen option
 * Return the updated list of votes
 */
dbret.saveSubscription = async (data, callback) => {
  // Insert new Log table entry indicating the user choice and timestamp
  try {
    // Check the vote is valid
    // Build the user data from the front-end and the current time into the sql query
    await db.run('INSERT INTO Subscriptions (data) VALUES (?)', [data]);
    callback(false);
  } catch (dbError) {
    callback(true);
    console.error(dbError);
  }
};

/**
 * Get logs
 *
 * Return choice and time fields from all records in the Log table
 */
dbret.getLogs = async () => {
  // Return most recent 20
  try {
    // Return the array of log entries to admin page
    return await db.all('SELECT * from Log ORDER BY time DESC LIMIT 20');
  } catch (dbError) {
    console.error(dbError);
  }
};

/**
 * Clear logs and reset votes
 *
 * Destroy everything in Log table
 * Reset votes in Subscriptions table to zero
 */
dbret.clearHistory = async () => {
  try {
    // Delete the logs
    await db.run('DELETE from Log');

    // Reset the vote numbers
    await db.run('UPDATE Subscriptions SET picks = 0');

    // Return empty array
    return [];
  } catch (dbError) {
    console.error(dbError);
  }
};

export default dbret;
