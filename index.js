// Import ng mga kailangan na libraries
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // I-import ang sqlite3

// Gumawa ng Express app
const app = express();
const PORT = 3000;

// I-setup ang database connection
const db = new sqlite3.Database('./blog.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the blog database.');
        // Gagawa ng 'posts' table kapag connected na
        db.run(`
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                content TEXT
            )
        `, (createErr) => {
            if (createErr) {
                console.error('Error creating posts table:', createErr.message);
            }
        });
    }
});

// Middleware
app.use(express.json());
app.use(cors());

// Isang simpleng route
app.get('/', (req, res) => {
    res.send('Blog App Backend is running!');
});

// Route para mag-submit ng bagong post
app.post('/posts', (req, res) => {
    const { title, content } = req.body;
    const stmt = db.prepare('INSERT INTO posts (title, content) VALUES (?, ?)');
    stmt.run(title, content, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        console.log(`A new post has been inserted with rowid ${this.lastID}`);
        res.status(201).json({ id: this.lastID, title, content });
    });
    stmt.finalize();
});
// Route para makuha ang lahat ng posts
app.get('/posts', (req, res) => {
    db.all('SELECT * FROM posts', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Simulan ang server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});