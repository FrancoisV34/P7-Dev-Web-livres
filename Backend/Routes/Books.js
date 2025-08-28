const express = require('express');
const bookCtrl = require('../Controllers/Books');
const auth = require('../Middleware/Auth');
const multer = require('../Middleware/Multer-Config');

const router = express.Router();

router.post('/', auth, multer, bookCtrl.createBook);
router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestBooks);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.get('/:id', bookCtrl.getOneBook);

module.exports = router;
