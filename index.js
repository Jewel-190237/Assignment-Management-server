const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


app.use(cors({ origin: "*" }));
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Assignment 11 is running');
})


app.listen(port, (req, res) => {
    console.log(`Assignment 11 is running on ${port}`)
})

