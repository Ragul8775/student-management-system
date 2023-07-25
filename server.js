const express = require("express");
const app = express();
const bcrypt = require('bcrypt');
const connection = require('./utlis/database');
const { createToken, VerifyToken } = require("./JWT");

const cookie = require('cookie-parser');
const PORT = 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(reqLogger);
app.use(cookie());

function reqLogger(req, res, next) {
    console.log(`${req.method}: ${req.url}`);
    next();
}

// Routers

// Home page with user verification using VerifyToken middleware
app.get("/", VerifyToken, (req, res) => {
    const user = req.user;
    console.log(user);
    res.render("index", { user });
});

// Login page
app.get("/login", (req, res) => {
    res.render("login");
});

// Register page
app.get("/register", (req, res) => {
    res.render("register");
});

// Sending an update form 
app.get('/students/:rollno/update', VerifyToken, async (req, res) => {
    try {
        // Check if the user is a teacher, if not, redirect to the home page
        if (req.user.role !== 'teacher') {
            return res.redirect('/');
        }

        const { rollno } = req.params;
        const [student] = await connection.promise().query(`SELECT * FROM students WHERE rollno='${rollno}'`);
        if (student.length > 0) {
            res.render('update', { student: student[0] });
        } else {
            res.render('error', { message: 'Student with given rollno does not exist' });
        }
    } catch (error) {
        console.log(error);
        res.render('error', { ...error });
    }
});

// Route for logout
app.get("/logout", (req, res) => {
    // Clear the access-token cookie to logout the user
    res.clearCookie("access-token");

    // Redirect the user to the login page
    res.redirect("/login");
});

/* Register Logic */
app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const name = req.body.name;
        const rollno = req.body.rollno;
        const dept = req.body.dept;
        const role = req.body.role;
        const password = hashedPassword;

        const query = `
            INSERT INTO registers (name, rollno, dept, role, password) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const values = [name, rollno, dept, role, password];

        const response = await connection.promise().query(query, values);

        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
});

/* Login Logic */
app.post("/login", async (req, res) => {
    try {
        const rollno = req.body.rollno;
        const password = req.body.password;
        const query = 'SELECT password, role, name, rollno, dept FROM registers WHERE rollno = ?';
        const [user, fields] = await connection.promise().query(query, [rollno]);

        if (user.length === 0) {
            res.sendStatus(401).json({ message: "User does not exist" });
        }
        const hashedPassword = user[0].password;
        const isPasswordMatch = await bcrypt.compare(password, hashedPassword);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const accessToken = createToken(user[0]);
        res.cookie("access-token", accessToken, {
            maxAge: 60 * 24 * 30 * 1000, // 30 days
            httpOnly: true
        });

        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.status(404).json({ error: "Internal Server Error!!" });
    }
});

// CREATE Students
app.post('/', async (req, res) => {
    try {
        const { name, rollno, dept, dob, email } = req.body;
        const query = 'INSERT INTO students (name, rollno, dept, dob, email) VALUES (?, ?, ?, ?, ?)';
        const values = [name, rollno, dept, dob, email];
        await connection.promise().query(query, values);

        res.redirect('/')

        
    } catch (error) {
        console.log(error);
        res.status(403).json('error', { ...error });
    }
});

// Read all students
app.get('/students', VerifyToken, async (req, res) => {
    const user = req.user;

    try {
        const [rows] = await connection.promise().query('SELECT * FROM students');
        return res.render('students', { students: rows, user: user }); // Combine the students and user objects into a single object
    } catch (error) {
        console.log(error);
        res.render('error', { ...error });
    }
});

// Read student by roll.No
app.get('/search', async (req, res) => {
    try {
        const rollno = req.query.rollno;

        const [rows] = await connection.promise().query(`SELECT * FROM students WHERE rollno='${rollno}'`);
        if (rows.length > 0 && rows[0]) {
            return res.render('student', { student: rows[0] });
        }
        return res.render('error', { message: 'Student with the given roll number does not exist' });
    } catch (error) {
        console.log(error);
        res.render('error', { ...error });
    }
});

// Update a student
app.post('/students/:rollno/update', VerifyToken, async (req, res) => {
    try {
        // Check if the user is a teacher, if not, redirect to the home page
        if (req.user.role !== 'teacher') {
            return res.redirect('/');
        }

        const { name, dept, dob, email } = req.body;
        const { rollno } = req.params;

        // Perform the update query
        const query = 'UPDATE students SET name=?, dept=?, dob=?, email=? WHERE rollno=?';
        const values = [name, dept, dob, email, rollno];
        await connection.promise().query(query, values);

        // Redirect to the student details page after successful update
        res.redirect(`/students`);
    } catch (error) {
        console.log(error);
        res.render('error', { ...error });
    }
});

// Delete a student
app.post('/students/:rollno/delete', VerifyToken, async (req, res) => {
    const user = req.user;
    const { rollno } = req.params;

    try {
        // Check if the user is a teacher before allowing the delete operation
        if (user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied. Only teachers can delete students.' });
        }

        // Perform the delete operation here
        // Example query:
        const query = 'DELETE FROM students WHERE rollno = ?';
        const [result] = await connection.promise().query(query, [rollno]);

        if (result.affectedRows > 0) {
            res.redirect(`/students`);
        } else {
            return res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Server listening
connection.promise().connect().then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
        console.log('Server running on http://localhost:3000.');
    });
}).catch((err) => {
    console.log('Unable to connect to database');
    console.log(err);
});
