//adminRoutes.js
const express = require("express");
const db = require('../database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const adminDb = require('../admindatabase');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'G7$k9@q2!mZ3#xP8^tR6&fL1*eW5!hQ0';

// Admin login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    adminDb.get(`SELECT * FROM admin_users WHERE email = ?`, [email], (err, admin) => {
        if (err) {
            return res.status(500).send("Error fetching admin");
        }
        if (!admin) {
            return res.status(404).send("Admin not found");
        }
        const passwordIsValid = bcrypt.compareSync(password, admin.password);
        if (!passwordIsValid) {
            return res.status(401).send("Invalid password");
        }
        
        const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '24h' }); 
        res.status(200).send({ auth: true, token });
    });
});

// Get all users 
router.get('/users', (req, res) => {
    db.all(`SELECT * FROM users`, [], (err, users) => {
        if (err) {
            return res.status(500).send("Error fetching users");
        }
        res.status(200).send(users);
    });
});

// Create a new user (admin route)
router.post('/users', (req, res) => {
    const { name, email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).send("Error checking email");
        }
        if (user) {
            return res.status(400).send("Email already exists");
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashedPassword], function(err) {
            if (err) {
                return res.status(500).send("Error registering user");
            }
            res.status(201).send({ id: this.lastID });
        });
    });
});

// Delete User by Admin (public route)
router.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).send("Error deleting user");
        }
        if (this.changes === 0) {
            return res.status(404).send("User  not found");
        }
        res.status(200).send("User  deleted successfully");
    });
});

// View uploaded CV
router.get('/cv/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT cv FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            console.error("Database error:", err); 
            return res.status(500).send("Error fetching user");
        }
        if (!user || !user.cv) {
            return res.status(404).send("CV not found");
        }

        const cvPath = path.join(__dirname, '../', user.cv); 

        if (!fs.existsSync(cvPath)) {
            console.warn(`CV file does not exist at path: ${cvPath}`); 
            return res.status(404).send("CV file does not exist");
        }

        res.sendFile(cvPath, (err) => {
            if (err) {
                console.error("Error sending CV file:", err); 
                return res.status(err.status).end();
            }
        });
    });
});

module.exports = router;