const fs = require('fs');
const sharp = require('sharp');
const path = require('path');
const Book = require('../Models/Book');

exports.createBook = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image manquante' });
  }

  const filename =
    Date.now() + '-' + req.file.originalname.split('.')[0] + '.webp';
  const filepath = path.join(__dirname, `../images/${filename}`);

  await sharp(req.file.path).webp({ quality: 80 }).toFile(filepath);

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
  });
  await book
    .save()
    .then(() => {
      res.status(201).json({ message: 'Livre enregistré !' });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyBook = async (req, res, next) => {
  try {
    let bookObject;
    if (req.file) {
      const filename =
        Date.now() + '-' + req.file.originalname.split('.')[0] + '.webp';
      const filepath = path.join(__dirname, `../images/${filename}`);

      await sharp(req.file.path).webp({ quality: 80 }).toFile(filepath);
      bookObject = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
      };
    } else {
      bookObject = { ...req.body };
    }
    delete bookObject._userId;

    await Book.findOne({ _id: req.params.id })
      .then((book) => {
        if (book.userId != req.auth.userId) {
          res.status(401).json({ message: 'Non-autorisé' });
        } else {
          Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: 'Livre modifié !' }))
            .catch((error) => res.status(401).json({ error }));
        }
      })
      .catch((error) => {
        res.status(400).json({ error });
      });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId.toString() !== req.auth.userId) {
        return res.status(401).json({ message: 'Non autorisé' });
      }
      const filename = book.imageUrl.split('/images/')[1];
      const filepath = path.join(__dirname, '../images', filename);

      fs.unlink(filepath, (error) => {
        if (error) {
          console.warn('Erreur suppression image :', error);
        }

        Book.deleteOne({ _id: req.params.id })
          .then(() =>
            res
              .status(200)
              .json({ message: 'Livre supprimé !', bookUserId: book.userId })
          )
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(201).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => res.status(201).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.postBookRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.ratings.find((rating) => rating.userId === req.auth.userId)) {
        return res
          .status(400)
          .json({ message: 'Vous avez déjà noté ce livre' });
      }
      console.log('BODY:', req.body);
      const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
      };

      book.ratings.push(newRating);
      const total = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = total / book.ratings.length;
      console.log('UPDATED BOOK:', book);

      book
        .save()
        .then((updatedBook) => res.status(200).json(updatedBook))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};
