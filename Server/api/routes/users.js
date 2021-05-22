const express = require('express');
const router = express.Router();

const { signup, login, getAll, getCurrent} = require('../controllers/users');

router.post('/login', login);

router.post('/signup', signup);

router.get('/', getAll);

router.get('/current', getCurrent);


module.exports = router;