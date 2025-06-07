const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming booksdb.js exists and exports a 'books' object
const regd_users = express.Router();

let users = []; // This array will store registered users

const isValid = (username) => { //returns boolean
    // Check if the username is not null, not empty, and hasn't been used by another user
    return (username && username.length > 0 && !users.some(user => user.username === username));
}

const authenticatedUser = (username, password) => { //returns boolean
    // Check if username and password match the one we have in records.
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username; // Get username from session 

    if (!username) {
        return res.status(403).json({ message: "User not logged in." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        // If the same user posts a different review on the same ISBN, it should modify the existing review. 
        books[isbn].reviews[username] = review;
        return res.status(200).json({ message: `Review for ISBN ${isbn} by ${username} modified successfully.` });
    } else {
        // If another user logs in and posts a review on the same ISBN, it will get added as a different review under the same ISBN. 
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: `Review for ISBN ${isbn} by ${username} added successfully.` });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
