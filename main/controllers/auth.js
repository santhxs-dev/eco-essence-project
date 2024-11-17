const crypto = require('crypto')

const MAILER_MAIL = process.env.MAILER_MAIL
const MAILER_PASS = process.env.MAILER_PASS

const bcrypt = require('bcryptjs');
const User = require('../models/user');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAILER_MAIL,
    pass: MAILER_PASS
  }
});

exports.getProfile = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      const cartProds = user.cart.items
      console.log('Fetched User Products in Cart: ' + cartProds)
      res.render('auth/profile', {
        title: 'EcoEssence | Perfil',
        nav: true,
        end: true,
        style: 'profile.css',
        user: req.user,
        cartProds: cartProds
      })
    })
}

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    title: 'EcoEssence | Cadastro',
    style: 'auth.css',
    nav: true,
    end: true,
    errorMessage: message
  })
}

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    title: 'EcoEssence | Login',
    style: 'auth.css',
    nav: true,
    end: true,
    errorMessage: message
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    title: 'Login | Resetar senha',
    style: 'auth.css',
    nav: true,
    end: true,
    errorMessage: message
  });
}

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render('auth/new-password', {
        title: 'Resetar senha | Nova senha',
        style: 'auth.css',
        nav: true,
        end: true,
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(err => {
      console.log(err)
    })
}

exports.postSignup = (req, res, next) => {
  const name = req.body.username
  const email = req.body.email;
  const password = req.body.password;
  // const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        req.flash(
          'error',
          'E-Mail já existente, por favor, utilize outro.'
        );
        return res.redirect('/signup');
      }
      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          return user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'joseluizsff@gmail.com',
            subject: 'Cadastro realizado',
            text: 'Sua conta no EcoEssence Market foi realizada com sucesso!'
          })
        })
        .catch(err => {
          console.log(err);
        });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'E-Mail ou senha inválidos.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            transporter.sendMail({
              to: email,
              from: 'joseluizsff@gmail.com',
              subject: 'Login realizado',
              text: 'Seu login na EcoEssence Market foi feita com sucesso!'
            })
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'E-Mail ou senha inválidos.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
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

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect('/')
    }
    const token = buffer.toString('hex')
    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Nenhuma conta encontrada com este E-Mail!')
          return res.redirect('/reset')
        }
        user.resetToken = token
        user.resetTokenExpiration = Date.now() + 3600000
        return user.save()
      })
      .then(result => {
        res.redirect('/')
        const html = `<p>Olá,</p><p>Você solicitou redefinir sua senha no site EcoEssence.</p><p>Entre no seguinte link em seu navegador:</p><p>${process.env.CODESPACE_URL}reset/${token}</p><p>Se você não fez esta solicitação, ignore este e-mail.</p>`
        transporter.sendMail({
          to: req.body.email,
          from: 'joseluizsff@gmail.com',
          subject: 'Redefinir senha EcoEssence',
          html: html
        })
      })
      .catch(err => {
        console.log(err)
      })
  })
}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password
  const userId = req.body.userId
  const passwordToken = req.body.passwordToken
  let resetUser
  
  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
    .then(user => {
      resetUser = user
      return bcrypt.hash(newPassword, 12)
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.resetTokenExpiration = undefined
      return resetUser.save()
    })
    .then(result => {
      res.redirect('/login')
    })
    .catch(err => {
      console.log(err)
    })
}