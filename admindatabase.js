//adminDatabase.js
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const adminDb = new sqlite3.Database('./admindatabase.db');

adminDb.serialize(() => {
    // Create the admin_users table if it doesn't exist
    adminDb.run(`CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            // Insert an initial admin user if the table was just created
            adminDb.get(`SELECT COUNT(*) AS count FROM admin_users`, [], (err, row) => {
                if (err) {
                    console.error("Error checking admin_users:", err.message);
                } else if (row.count === 0) {
                    const email = 'admin@gmail.com';
                    const password = '123456';

                    const hashedPassword = bcrypt.hashSync(password, 8); 

                    adminDb.run(`INSERT INTO admin_users (email, password) VALUES (?, ?)`, [email, hashedPassword], function(err) {
                        if (err) {
                            console.error("Error inserting initial admin user:", err.message);
                        } else {
                            console.log(`Inserted initial admin user with ID: ${this.lastID}`);
                        }
                    });
                }
            });
        }
    });
});

module.exports = adminDb;