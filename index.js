const http = require('http');
const express = require('express');
const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static("express"));
// default URL for website
app.get('/', function(req,res){
    res.sendFile(path.join(__dirname+'/dist/index.html'));
    //__dirname : It will resolve to your project folder.
});
// Serve static files from /browser
app.use('/static', express.static('dist'));
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
});
const server = http.createServer(app);
const port = 3000;
server.listen(port);
console.debug('Server listening on port ' + port);
//console.log(html_data);
