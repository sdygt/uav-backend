const express = require('express');
const app = express();

app.all('/',(req,res,next)=>{
    next(new Error('Not yet implemented\nALL /uav'));
});

module.exports = app;
