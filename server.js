const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

const db = new sqlite3.Database('code69_clone.db');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ users: rows });
    });
});

app.post('/api/users', (req, res) => {
    const { name, email } = req.body;
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    stmt.run(name, email, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
    stmt.finalize();
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT)");
    db.run("INSERT INTO users (name, email) VALUES ('John Doe', 'john@example.com')");
    db.run("INSERT INTO users (name, email) VALUES ('Jane Smith', 'jane@example.com')");
});

process.on('SIGINT', () => {
    db.close();
    process.exit();
});
