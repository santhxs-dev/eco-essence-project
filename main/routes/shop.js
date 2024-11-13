const express = require('express')
const controller = require('../controllers/shop')

const router = express.Router()

router.get('/', controller.getHome)
router.get('/shop', controller.getShop)
router.get('/shop/:productId', controller.getProduct)
router.get('/about', controller.getAbout)
router.get('/contact', controller.getContact)
// router.get('/profile', controller.getProfile)
// router.get('/login', controller.getLogin)
router.get('/cart', controller.getCart)
router.get('/orders', controller.getOrders)

router.post('/cart', controller.postCart)
router.post('/cart-delete', controller.postCartDelete)
router.post('/create-order', controller.postOrder);

module.exports = router