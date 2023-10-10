require('dotenv').config();

const express = require('express');
const db = require('./config/db');

//connect to mongodb database
db();

const app = express();
app.use(express.json());

app.listen(5000, () => {
    console.log(`Server Started at ${5000}`)
})