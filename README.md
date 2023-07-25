# Student Management System

## Introduction
Student Management System is a web application built with Node.js, Express, and MySQL that allows teachers to manage student records. It provides features for creating, reading, updating, and deleting student information. Teachers can log in using their credentials and access various functionalities based on their roles.

## Features
- User registration and login with role-based authentication (teacher and student).
- Teachers can view a list of all students and their details.
- Teachers can search for students by roll number.
- Teachers can create new student records.
- Teachers can update existing student records.
- Teachers can delete student records.

## Database Setup
Before running the application, you need to set up your database. Make sure you have MySQL installed on your system. Then, create a new database and import the database schema provided in the `database_schema.sql` file.

1. Create a new database using the MySQL command line or a GUI tool like phpMyAdmin.
2. Import the database schema:
3. Replace `<username>` with your MySQL username, `<database_name>` with the name of the database you created, and make sure you provide the correct path to the `database_schema.sql` file.

## Installation
Follow the steps below to run the application on your local system:

1. Clone the repository: https://github.com/your-username/student-management-system.git
2. Change into the project directory:cd student-management-system
3.  Install the dependencies:npm install
4.  Create a `.env` file in the project root directory and provide the following environment variables:DB_HOST=your_database_host
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
5.Start the server:npm start
6.The application will be accessible at `http://localhost:3000` in your browser.

## Usage
1. Open your web browser and go to `http://localhost:3000`.
2. If you are a new user, click on the "Register" link to create a new account. Provide the required details and choose your role (teacher or student).
3. If you already have an account, click on the "Login" link and enter your credentials.
4. Once logged in, you will be redirected to the dashboard, where you can view, add, update, or delete student records (if you are a teacher).

## Contributing
Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
