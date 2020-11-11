const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const exjwt = require('express-jwt');
const bodyParser = require('body-parser');
const path = require('path');

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/');
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Authorization');
    next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


const PORT = 3000;
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




app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    for (user of users){
        if (username == user.username && password == user.password){
            let token = jwt.sign({ id:user.id, username: user.username}, secretKey, { expiresIn: '7d' });
            res.json({
                success: true,
                err: null,
                tokenValue: token
            });
            break;
        }
        else {
            res.status(401).json({
                success: false,
                tokenValue: null,
                err: "Username or Password is incorrect"
            });
        }
    }

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


















