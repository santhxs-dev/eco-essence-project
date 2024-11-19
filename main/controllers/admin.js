const Product = require('../models/product')

exports.getAdminArea = (req, res, next) => {
  res.render('admin/admin-area', {
    title: 'Admin | Área Admin',
    nav: true,
    end: false,
    style: 'admin-area.css',
  })
}

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-edit-product', {
    title: 'Admin | Adicionar Produto',
    nav: true,
    end: false,
    style: 'add-edit-product.css',
    editing: false,
  })
}

// fazer um middleware proprio pro user ver seus prods
exports.getAdminProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    .then(products => {
    res.render('admin/products', {
      title: 'Admin | Produtos',
      nav: true,
      end: false,
      style: 'admin-products.css',
      products: products,
    })
  }).catch(err => {
    console.log(err)
  })
}

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/add-edit-product', {
        title: 'Admin | Editar Produto',
        editing: editMode,
        product: product,
        nav: true,
        end: true,
        style: 'add-edit-product.css',
      });
    })
    .catch(err => console.log(err));
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: userId
  });
  product
    .save()
    .then(result => {
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(result => {
      console.log('Updated Product');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};


exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId
  Product.findByIdAndDelete(prodId).then(result => {
    console.log('Deleted product')
    res.redirect('/admin/products')
  }).catch(err=> {
    console.log(err)
  })
}
