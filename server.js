const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');
const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'sql9.freemysqlhosting.net',
    user: 'sql9378996',
    password: 'VANDLpmvpw',
    database: 'sql9378996'
});

app.use(express.static(__dirname + '/public'));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://167.172.141.117:3000/');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = process.env.port || 3000;
const secretKey = "secret key!";
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});
var theUser;


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    var hashedPW = stringToHash(password);

    var sql = "SELECT * FROM user WHERE username = '" + username +"'";
    connection.query(sql, function(err, results, fields) {
        if (err) throw err
        
        if (results.length == 0){
            console.log("No Such Username Exists")
        }
        else{
            if (hashedPW == results[0].password){
                let token = jwt.sign({ id:results[0].ID, username: username}, secretKey, { expiresIn: '7d' });
                res.json({
                    success: true,
                    err: null,
                    tokenValue: token
                });
                theUser = username;
                console.log("Login Successful")
            }
            else {
                res.status(401).json({
                    success: false,
                    tokenValue: null,
                    err: "Username or Password is incorrect"
                });
                console.log("Incorrect Password")
            }
        }
    })
});


app.post('/api/register', (req) => {
    const { username, password } = req.body;
    var hashedPW = stringToHash(password);

    var sql = "SELECT * FROM user WHERE username = '" + username +"'";
    connection.query(sql, function(err, results) {
        if (err) throw err
        
        if (results.length == 0){
            var sql = "insert into user values(null, '"+ username +"', '"+ hashedPW + "')";
            connection.query(sql, function(err) {
                if (err) throw err
            })


            var sql = "CREATE TABLE " + username + "(FieldName VARCHAR(255), FieldValue DOUBLE(10,2));";
            connection.query(sql, function(err) {
                if (err) throw err
            })
        }
        else {
            console.log("Error! Username already exists");
        }
    })
});


app.post('/api/addcharge', (req) => {
    const { name, value } = req.body;

    var sql = "INSERT INTO " + theUser + "(FieldName, FieldValue) VALUES ('" + name + "', " + value + ");";
    connection.query(sql, function(err, results) {
        if (err) throw err
    })
});

app.post('/api/deletecharge', (req) => {
    const {name} = req.body;
    console.log("name: ", name);
    var sql = "DELETE FROM " + theUser + " WHERE '" + name + "' = FieldName;";
    console.log(sql);
    connection.query(sql, function(err, results) {
        if (err) throw err
    })
});


app.get('/budget', (res) => {
    var sql = "SELECT * FROM " + theUser;
    connection.query(sql, function(err, results) {
        if (err) throw err
        res.json(results);
    })
});


app.get('/api/dashboard', jwtMW, (res) => {
    res.json({
        success: true,
        myContent: 'Hello! This app helps you manage your budget. First, enter your monthly budget. Then enter a budget category and its monthly cost into the add field and add charge areas respectively. Press create to add that record. Press graph to view your budget distribution.'
    });
});


app.get('/', (res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


app.use(function (err, res, next) {
    if(err.name === 'UnauthorizedError') {
        res.status(401).json({
            success: false,
            officialError: err,
            err: "Username or Password is incorrect 2"
        });
    }
    else{
        next(err);
    }
});


app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});

// hash to 32 bit number 
function stringToHash(string) { 
                  
    var hash = 0; 
      
    if (string.length == 0) return hash; 
      
    for (i = 0; i < string.length; i++) { 
        char = string.charCodeAt(i); 
        hash = ((hash << 5) - hash) + char; 
        hash = hash & hash;
    }
    return hash; 
} 






