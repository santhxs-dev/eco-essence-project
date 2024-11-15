const Product = require('../models/product')
const User = require('../models/user')
const Order = require('../models/order')

exports.getHome = (req, res, next) => {
    res.render('shop/home', {
        title: 'EcoEssence | Home',
        nav: true,
        end: true,
        style: 'home.css',
    })
}

exports.getShop = (req, res, next) => {
    Product.find().then(products => {
        console.log('Products: ' + products)
        res.render('shop/shop', {
            title: 'EcoEssence | Loja',
            nav: true,
            end: true,
            style: 'shop.css',
            products: products,
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId
    Product.findById(prodId)
        .then(product => {
            console.log('Fetched product: ' + product)
            res.render('shop/product-detail', {
                title: 'Loja | Detalhes do Produto',
                nav: true,
                end: true,
                style: 'product-detail.css',
                product: product,
            });
        })
        .catch(err => console.log(err));
}

exports.getAbout = (req, res, next) => {
    res.render('shop/about', {
        title: 'EcoEssence | Sobre',
        nav: true,
        end: true,
        style: 'about.css',
    })
}

exports.getContact = (req, res, next) => {
    res.render('shop/contact', {
        title: 'EcoEssence | Contatos',
        nav: true,
        end: true,
        style: 'contact.css',
    })
}

exports.getProfile = (req, res, next) => {
    // ...
}

exports.getLogin = (req, res, next) => {
    // ...
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', {
                products: products,
                title: 'EcoEssence | Carrinho',
                nav: true,
                end: true,
                style: 'cart.css',
            });
        })
        .catch(err => console.log(err));
};


exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            console.log(result);
            res.redirect('/cart');
        });
};

exports.postCartDelete = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
      .removeFromCart(prodId)
      .then(result => {
        res.redirect('/cart');
      })
      .catch(err => console.log(err));
  };

  exports.postOrder = (req, res, next) => {
    req.user
      .populate('cart.items.productId')
      .then(user => {
        const products = user.cart.items.map(i => {
          return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
          user: {
            name: req.user.name,
            userId: req.user
          },
          products: products
        });
        return order.save();
      })
      .then(result => {
        return req.user.clearCart();
      })
      .then(() => {
        res.redirect('/orders');
      })
      .catch(err => console.log(err));
  };
  
  exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
      .then(orders => {
        res.render('shop/orders', {
          title: 'Carrinho | Pedidos',
          style: 'orders.css',
          nav: true,
          end: true,
          orders: orders,
        });
      })
      .catch(err => console.log(err));
  };
  