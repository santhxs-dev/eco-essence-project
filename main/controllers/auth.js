const User = require('../models/user');

// Login section

exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    title: 'EcoEssence | Login',
    style: 'auth.css',
    nav: true,
    end: true,
    isAuthenticated: false
  });
};

exports.postLogin = (req, res, next) => {
  User.findById('6733b97a338988eecb343963')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      console.log('User: ' + user)
      req.session.save(err => {
        // Assim só renderiza quando estiver tudo certo
        console.log(err);
        res.redirect('/');
      });
    })
    .catch(err => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

// Profile Section

exports.getProfile = (req, res, next) => {
  res.render('auth/profile', {
    title: 'EcoEssence | Perfil',
    nav: true,
    end: true,
    style: 'profile.css',
    isAuthenticated: req.session.isLoggedIn
  })
}