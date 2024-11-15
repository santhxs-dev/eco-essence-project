const express = require('express')
const controller = require('../controllers/admin')
const isAuth = require('../middlewares/is-auth')

const router = express.Router()

router.get('/admin-area', isAuth, controller.getAdminArea)
router.get('/add-product', isAuth, controller.getAddProduct)
router.get('/products', isAuth, controller.getAdminProducts)
router.get('/edit-product/:productId', isAuth, controller.getEditProduct)

router.post('/add-product', isAuth, controller.postAddProduct)
router.post('/edit-product', isAuth, controller.postEditProduct)
router.post('/delete-product', isAuth, controller.postDeleteProduct)

module.exports = router