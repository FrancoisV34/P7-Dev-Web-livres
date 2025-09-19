const express = require('express');

const app = express();

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

app.use('/api/books', (req, res, next) => {
  const books = [
    {
      id: '1',
      title: 'Book Title 1',
      author: 'Author 1',
      imageURL: 'http://example.com/book1.jpg',
      year: 2021,
      genre: 'Exemple',
      ratings: [
        {
          userId: '1Exemple',
          grade: 4,
        },
      ],
      averageRating: 4,
    },
  ];
  res.status(201).json(books);
  next();
});

module.exports = app;
