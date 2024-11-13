const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const User = require('./models/user')

const shopRouter = require('./routes/shop')
const adminRouter = require('./routes/admin')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', 'views')

app.use((req, res, next) => {
  User.findById('6733b97a338988eecb343963')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use(shopRouter)
app.use('/admin', adminRouter)

app.use((req, res, next) => {
  res.status(404).render('404', {
    title: 'EcoEssence | Página não encontrada',
    nav: true,
    end: true,
    style:'home.css'
  })
})

mongoose
  .connect('mongodb+srv://eo-renki:18634022@cluster0.knfm8.mongodb.net/market-project?retryWrites=true&w=majority&appName=Cluster0')
  .then(result => {
    User.findOne().then(user => {
      if (!user) {
        const user = new User({
          name: 'Jxs',
          email: 'jxss@test.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
      console.log("Connected to MongoDB!");
      app.listen(3000);
    }).catch(err => {
      console.log("Erro to connect on MongoDB:", err);
    });
  })