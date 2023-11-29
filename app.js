//jshint esversion:6
require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const pg = require("pg");
const CryptoJS = require("crypto-js");


const app = express();

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "WebDevEge",
    password: "123456",
    port: 5432,
});
db.connect();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = {
    email: String,
    password: String
};
const secret = process.env.SECRET;
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});
app.get("/register", function (req, res) {
    res.render("register");
});

app.post("/register", async function (req, res) {
    const newUser = req.body.username;
    const newUserPassword = req.body.password;
    const ciphertext = CryptoJS.AES.encrypt(newUserPassword, secret).toString();
    console.log(ciphertext);

    try {
        await db.query(
            "INSERT INTO users (user_name, password) VALUES ($1, $2)",
            [newUser, ciphertext]
        );
        res.render("secrets");
    } catch (err) {
        console.log(err);
    }
});

app.post("/login", async function (req, res) {
    const user = req.body.username;
    const password = req.body.password;

    try {
        const result = await db.query("SELECT * FROM users WHERE user_name = ($1)", [user]);
        let item = result.rows;
        //console.log(result);
        console.log(item);
        const bytes = CryptoJS.AES.decrypt(item[0].password, secret);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        if (originalText === password) {
            res.render("secrets");

        }

    } catch (err) {
        console.log(err);
    }
});

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});