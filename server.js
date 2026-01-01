const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' directory
app.use('/assets', express.static(path.join(__dirname, 'assets'))); // Serve uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

// Database Setup
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            category TEXT,
            imagePath TEXT
        )`, (err) => {
            if (err) {
                console.error("Error creating table", err);
            }
        });
    }
});

// File Upload Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// API Endpoints

// Get all products
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": rows
        });
    });
});

// Add a new product
app.post('/api/products', upload.array('images', 10), (req, res) => {
    const { title, description, category } = req.body;
    const imagePaths = req.files ? req.files.map(f => `uploads/${f.filename}`) : [];

    const sql = 'INSERT INTO products (title, description, category, imagePath) VALUES (?,?,?,?)';
    const params = [title, description, category, JSON.stringify(imagePaths)];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "data": {
                id: this.lastID,
                title,
                description,
                category,
                imagePaths
            }
        });
    });
});

// Update a product
app.put('/api/products/:id', upload.array('images', 10), (req, res) => {
    const { title, description, category } = req.body;
    let imagePaths = req.files && req.files.length > 0
        ? req.files.map(f => `uploads/${f.filename}`)
        : JSON.parse(req.body.existingImagePath || "[]");

    const sql = `UPDATE products SET title = ?, description = ?, category = ?, imagePath = ? WHERE id = ?`;
    const params = [title, description, category, JSON.stringify(imagePaths), req.params.id];

    db.run(sql, params, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({
            "message": "success",
            "changes": this.changes
        });
    });
});


// Delete a product
app.delete('/api/products/:id', (req, res) => {
    db.run('DELETE FROM products WHERE id = ?', req.params.id, function (err, result) {
        if (err) {
            res.status(400).json({ "error": err.message });
            return;
        }
        res.json({ "message": "deleted", changes: this.changes });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
