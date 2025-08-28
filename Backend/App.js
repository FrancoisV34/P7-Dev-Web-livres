const express = require('express');
const path = require('path');

const app = express();

const mongoose = require('mongoose');
app.use(express.json());

const bookRoutes = require('./Routes/Books');
const userRoutes = require('./Routes/User');

mongoose
  .connect(
    'mongodb+srv://francoisAdmin:Binnaa.4694@books.frwau30.mongodb.net/?retryWrites=true&w=majority&appName=Books',
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err);
  res
    .status(500)
    .json({ message: 'Erreur interne serveur', error: err.message });
});

module.exports = app;
