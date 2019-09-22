//CARREGANDO OS MODULOS - CONSTANT
const express = require("express");
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const admin = require("./routes/admin");
const patch = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categoria");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
require("./config/auth")(passport);

// CONFIGURAÇÕES
//SESSÃO
app.use(
  session({
    secret: "cursodenode",
    raseve: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//MIDDLEWARE
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// HANDLEBARS
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//MONGOOSE
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(function() {
  console.log("Conectado com sucesso").catch(function(erro) {
    console.log("Erro ao conectar " + erro);
  });
});

//PUBLIC
app.use(express.static(patch.join(__dirname, "public")));

//ROTAS
app.use("/admin", admin);
app.use("/usuarios", usuarios);

app.get("/", function(req, res) {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(function(postagens) {
      res.render("index", { postagens: postagens });
    })
    .catch(function(err) {
      req.flash("error-msg", "houve um erro interno");
      res.redirect("/404");
    });
});

app.get("/404", function(req, res) {
  res.send("Erro 404!");
});
app.get("/posts", function(req, res) {
  res.send("Lista de Posts");
});

app.get("/categorias", function(req, res) {
  Categoria.find()
    .then(function(categorias) {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(function(err) {
      req.flash("error_msg", "houve um erro interno ao listar categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", function(req, res) {
  Categoria.findOne({ slug: req.params.slug })
    .then(function(categoria) {
      if (categoria) {
        Postagem.find({ categoria: categoria._id }).then(function(postagens) {
          res.render("categorias/postagens", {
            postagens: postagens,
            categoria: categoria
          });
        });
      } else {
        req.flash("error_msg", "Esta caregoria não existe");
        res.redirect("/");
      }
    })
    .catch(function(err) {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a pagina desta categoria"
      );
      res.redirect("/");
    });
});

//---------------------------------------------------------------------------

app.get("/postagem/:slug", function(req, res) {
  Postagem.findOne({ slug: req.params.slug })
    .then(function(postagem) {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe");
        res.redirect("/");
      }
    })
    .catch(function(err) {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

//OUTROS
const PORT = 8881;
app.listen(PORT, () => {
  console.log("Servidor Rodando!");
});
