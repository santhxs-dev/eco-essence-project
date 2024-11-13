const express = require('express')
const controller = require('../controllers/admin')

const router = express.Router()

router.get('/admin-area', controller.getAdminArea)
router.get('/add-product', controller.getAddProduct)
router.get('/products', controller.getAdminProducts)
router.get('/edit-product/:productId', controller.getEditProduct)

router.post('/add-product', controller.postAddProduct)
router.post('/edit-product', controller.postEditProduct)
router.post('/delete-product', controller.postDeleteProduct)

module.exports = router