const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection WITHOUT database first
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "gopi"
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.log("MySQL connection error:", err);
        return;
    }

    console.log("Connected to MySQL.");

    // Create database automatically
    db.query("CREATE DATABASE IF NOT EXISTS school", (err) => {
        if (err) {
            console.log("Database creation error:", err);
            return;
        }

        console.log("Database school is ready.");

        // Select school database
        db.changeUser({ database: "school" }, (err) => {
            if (err) {
                console.log("Database selection error:", err);
                return;
            }

            createStudentsTable();
        });
    });
});


// ============================================
// CREATE STUDENTS TABLE
// ============================================

function createStudentsTable() {

    // Delete old table so wrong columns are removed
    db.query("DROP TABLE IF EXISTS students", (err) => {

        if (err) {
            console.log("Old table delete error:", err);
            return;
        }

        // Create correct table
        const sql = `
            CREATE TABLE students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                total INT NOT NULL
            )
        `;

        db.query(sql, (err) => {

            if (err) {
                console.log("Table creation error:", err);
                return;
            }

            console.log("Students table is ready.");

            insertSampleStudents();
        });
    });
}


// ============================================
// INSERT 5 SAMPLE STUDENTS
// ============================================

function insertSampleStudents() {

    const students = [
        ["Pavani", 450],
        ["Gopi", 420],
        ["Ravi", 390],
        ["Sita", 460],
        ["Kiran", 410]
    ];

    const sql = `
        INSERT INTO students (name, total)
        VALUES ?
    `;

    db.query(sql, [students], (err) => {

        if (err) {
            console.log("Sample data error:", err);
            return;
        }

        console.log("5 sample students inserted.");
    });
}


// ============================================
// HOME PAGE
// ============================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "index.html")
    );

});


// ============================================
// GET ALL STUDENTS
// ============================================

app.get("/students", (req, res) => {

    const sql = `
        SELECT id, name, total
        FROM students
        ORDER BY id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log("Display error:", err);
            return res.status(500).send("Database error");
        }

        res.json(results);
    });

});


// ============================================
// INSERT STUDENT
// ============================================

app.post("/insert", (req, res) => {

    const name = req.body.name;
    const total = req.body.total;

    if (!name || !total) {
        return res.send("Please enter Name and Total.");
    }

    const sql = `
        INSERT INTO students (name, total)
        VALUES (?, ?)
    `;

    db.query(sql, [name, total], (err) => {

        if (err) {
            console.log("Insert error:", err);
            return res.status(500).send("Insert failed");
        }

        res.redirect("/index.html");
    });

});


// ============================================
// UPDATE STUDENT
// ============================================

app.post("/update", (req, res) => {

    const id = req.body.id;
    const name = req.body.name;
    const total = req.body.total;

    const sql = `
        UPDATE students
        SET name = ?, total = ?
        WHERE id = ?
    `;

    db.query(sql, [name, total, id], (err) => {

        if (err) {
            console.log("Update error:", err);
            return res.status(500).send("Update failed");
        }

        res.redirect("/index.html");
    });

});


// ============================================
// DELETE STUDENT
// ============================================

app.post("/delete", (req, res) => {

    const id = req.body.id;

    const sql = `
        DELETE FROM students
        WHERE id = ?
    `;

    db.query(sql, [id], (err) => {

        if (err) {
            console.log("Delete error:", err);
            return res.status(500).send("Delete failed");
        }

        res.redirect("/index.html");
    });

});


// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {

    console.log(
        `Server running at http://localhost:${PORT}`
    );

});