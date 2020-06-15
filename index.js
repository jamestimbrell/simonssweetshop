const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const db = require('diskdb');

const app = express();

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// connect and remove any packs currently defined
db.connect('db', ['sweetpacks']);
db.sweetpacks.remove();

// create the collection
db.connect('db', ['sweetpacks']);

// setup initial data
var initialPacks = [{ size: 250 }, { size: 500 }, { size: 1000 }, { size: 2000 }, { size: 5000 }];
db.sweetpacks.save(initialPacks);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Route to get sweet packs
app.get('/api/sweetpacks', (req, res) => {

  // return it sorted. Note to self: use a DB with sorting next time dummy
  const packs = db.sweetpacks.find().sort((a, b) => parseFloat(a.size) - parseFloat(b.size));
  res.json(packs);
});

// Route to delete a sweet pack
app.delete('/api/sweetpacks/:id', (req, res) => {

  db.sweetpacks.remove({ _id: req.params.id });
  res.end('Record ' + req.params.id + ' has been deleted!');
});

// Route to add a new sweet pack
app.post('/api/sweetpacks/', jsonParser, (req, res) => {
  db.sweetpacks.save({ size: req.body.size });
  res.end('New size ' + req.body.size + ' has been added!');
});

// Catchall handler to serve React if it doesn't match an API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`Listening on ${port}`);