const express = require('express')
const controller = require('../controllers/auth')

const router = express.Router()

router.get('/login', controller.getLogin)

router.post('/login', controller.postLogin)
router.post('/logout', controller.postLogout)

module.exports = router