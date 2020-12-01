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

// app.get('/', async (req, res) => {
//     connection.connect();
//     connection.query('SELECT * FROM user', function (error, results, fields) {
//         connection.end();
//         if (error) throw error;
//         res.json(results);
//         console.log("res is: ", results[11].id);
//         console.log("res is: ", results[11].password);
//     });
// })





app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
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


const budget = {
    myBudget: [
    {
        title: 'Eat out',
        budget: 30
    },
    {
        title: 'Rent',
        budget: 10
    },
    {
        title: 'groceries',
        budget: 60
    },
    ]
};


let users = [
    {
        id: 1,
        username: 'chris',
        password: 'sanchez'
    },

    {
        id: 2,
        username: 'pie',
        password: 'test'
    }
];



// add hashing!
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    var sql = "SELECT * FROM user WHERE username = '" + username +"'";
    connection.query(sql, function(err, results, fields) {
        if (err) throw err

        if (password == results[0].password){
            let token = jwt.sign({ id:results[0].ID, username: username}, secretKey, { expiresIn: '7d' });
            res.json({
                success: true,
                err: null,
                tokenValue: token
            });
        }
        else {
            res.status(401).json({
                success: false,
                tokenValue: null,
                err: "Username or Password is incorrect"
            });
        }
    })
});

// add token
// add hashing!
app.post('/api/register', (req, res) => {
    console.log("Testing")
    const { username, password } = req.body;

    var sql = "SELECT * FROM user WHERE username = '" + username +"'";
    connection.query(sql, function(err, results, fields) {
        if (err) throw err
        
        // console.log("results: ", results.length);
        if (results.length == 0){
            var sql = "insert into user values(null, '"+ username +"', '"+ password + "')";
            connection.query(sql, function(err) {
                if (err) throw err
            })
        }
        else {
            console.log("Error! Username already exists");
        }

    })

});


app.get('/budget', (req, res) => {
    res.json(budget);
});


app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret Content for the initiated'
    });
});

app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret Content for the initiated'
    });
    
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});


app.use(function (err, req, res, next) {
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


















