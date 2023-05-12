'use strict';

const express = require('express');
const server = express();

server.use(express.static('public'));

const init = error => {
    if (error) console.warn(error);
    else console.log('Server is running... \n ...and running...');
}

server.listen(80, init);