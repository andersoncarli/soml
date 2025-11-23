// The Database class is responsible for handling all database operations.
// It provides methods to interact with the database, such as creating, reading, updating, and deleting data.
// It also handles database connections and transactions.

class Database {
    constructor() {
        this.connection = null;
    } 
    async connect(connectionString) {
        this.connection = await mysql.createConnection(connectionString);
    }
    async query(sql, values) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, values, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
    async close() {
        this.connection.end();
    }
