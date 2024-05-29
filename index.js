const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
app.use(express.urlencoded({extended:true}));

let users = [];
let exercises = [];

// POST /api/users
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  const _id = Math.random().toString(36).substr(2, 9);
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

app.get('/api/users', (req, res) => {
  const usersData = users.map(user => ({ username: user.username, _id: user._id }));
  res.json(usersData);
});

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }
  const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
  const exercise = { description, duration: parseInt(duration), date: exerciseDate };
  user.exercises = user.exercises || [];
  user.exercises.push(exercise);
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id
  });
});

// GET /api/users/:_id/logs
app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const user = users.find(user => user._id === userId);
  if (!user) {
    return res.json({ error: 'User not found' });
  }

  const { from, to, limit } = req.query;
  let log = user.exercises || [];

  if (from) {
    const fromDate = new Date(from);
    log = log.filter(exercise => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter(exercise => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, limit);
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({ description, duration, date }))
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
