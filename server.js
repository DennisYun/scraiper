const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/main.html');
});

app.get('/scraip', (req, res) => {
  res.sendFile(__dirname + '/public/scraip.html');
});

app.listen(PORT);
