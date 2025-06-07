const express = require('express');
let books = require("./booksdb.js"); // Assuming booksdb.js exists and exports a 'books' object
let isValid = require("./auth_users.js").isValid; // Assuming isValid is exported from auth_users.js
let users = require("./auth_users.js").users; // Assuming users array is exported from auth_users.js
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registred. Now you can login" });
        } else {
            return res.status(409).json({ message: "User already exists!" }); // 409 Conflict if username exists
        }
    }
    return res.status(400).json({ message: "Unable to register user. Username and password are required." }); // 400 Bad Request if no username or password 
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(JSON.stringify(books, null, 4)); // Using JSON.stringify for neat output 
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    let booksbyauthor = {};
    for (let isbn in books) {
        if (books[isbn].author === author) {
            booksbyauthor[isbn] = books[isbn];
        }
    }
    if (Object.keys(booksbyauthor).length > 0) {
        return res.status(200).json(booksbyauthor);
    } else {
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    let booksbytitle = {};
    for (let isbn in books) {
        if (books[isbn].title === title) {
            booksbytitle[isbn] = books[isbn];
        }
    }
    if (Object.keys(booksbytitle).length > 0) {
        return res.status(200).json(booksbytitle);
    } else {
        return res.status(404).json({ message: "No books found with this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn] && books[isbn].reviews) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
    }
});

module.exports.general = public_users;
