const express = require("express");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();
const multer = require('multer');


const JWT_SECRET = process.env.JWT_SECRET || 'G7$k9@q2!mZ3#xP8^tR6&fL1*eW5!hQ0';

// Login route
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err) {
            return res.status(500).send("Error fetching user");
        }
        if (!user) {
            return res.status(404).send("User not found");
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send("Invalid password");
        }
        
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' }); 
        res.status(200).send({ auth: true, token, userId: user.id }); 
    });
});

// Register User
router.post('/signup', (req, res) => {
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


// Get user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, user) => {
        if (err) {
            return res.status(500).send("Error fetching user");
        }
        if (!user) {
            return res.status(404).send("User  not found");
        }
        res.status(200).send(user);
    });
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Upload CV and update user information
router.post('/details/:id', upload.single('cv'), (req, res) => {
    const id = req.params.id;
    const { interest, phone, age, graduate_year, degree, branch, college } = req.body;
    const cvPath = req.file ? req.file.path : null;

    console.log("Updating user information for ID:", id);

    db.run(`UPDATE users SET interest = ?, phone = ?, age = ?, graduate_year = ?, degree = ?, branch = ?, college = ?, cv = ? WHERE id = ?`, 
        [interest, phone, age, graduate_year, degree, branch, college, cvPath, id], 
        function(err) {
            if (err) {
                console.error("Error updating user information:", err);
                return res.status(500).send("Error updating user information");
            }
            res.status(200).send("User  information updated successfully");
        }
    );
});

module.exports = router;