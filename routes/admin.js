const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("../models/Categoria");
const Categoria = mongoose.model("categorias");
require("../models/Postagem");
const Postagem = mongoose.model("postagens");
const { eAdmin } = require("../helpers/eAdmin");

router.get("/", eAdmin, function(req, res) {
  res.render("admin/index");
});

router.get("/posts", function(req, res) {
  res.send("Pagina de posts");
});

router.get("/categorias", eAdmin, function(req, res) {
  Categoria.find()
    .sort({ date: "desc" })
    .then(categorias => {
      res.render("admin/categorias", { categorias: categorias });
    })
    .catch(function() {
      req.flash("error_msg", "Houve um erro ao listar categorias");
      res.redirect("/admin");
    });
});

router.get("/categorias/add", eAdmin, function(req, res) {
  res.render("admin/addcategorias");
});

router.post("/categorias/nova", eAdmin, function(req, res) {
  //VALIDAÇÃO
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome invalido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug invalido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("admin/addcategorias", { erros: erros });
  } else {
    //CRIANDO CATEGORIA
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug
    };

    new Categoria(novaCategoria)
      .save()
      .then(function() {
        req.flash("success_msg", "Categoria criada com sucesso!");
        res.redirect("/admin/categorias");
      })
      .catch(function(erro) {
        req.flash(
          "error_msg",
          "Houve um erro ao cadastrar a categoria tente novamente"
        );
        res.redirect("/admin");
      });
  }
});

// EDITANDO CATEGORIA
router.get("/categorias/edit/:id", eAdmin, function(req, res) {
  Categoria.findOne({ _id: req.params.id })
    .then(function(categoria) {
      res.render("admin/editcategorias", { categoria: categoria });
    })
    .catch(function(err) {
      req.flash("error-msg", "Esta categoria não existe");
      res.redirect("/admin/categorias");
    });
});

router.post("/categorias/edit", eAdmin, function(req, res) {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome invalido" });
  }

  if (
    !req.body.slug ||
    typeof req.body.slug == undefined ||
    req.body.slug == null
  ) {
    erros.push({ texto: "Slug invalido" });
  }

  if (req.body.nome.length < 2) {
    erros.push({ texto: "Nome da categoria é muito pequeno" });
  }

  if (erros.length > 0) {
    res.render("admin/editcategorias", { erros: erros });
  } else {
    Categoria.findOne({ _id: req.body.id })
      .then(function(categoria) {
        categoria.nome = req.body.nome;
        categoria.slug = req.body.slug;

        categoria
          .save()
          .then(function() {
            req.flash("success_msg", "Categoria editada com sucesso!");
            res.redirect("/admin/categorias");
          })
          .catch(function(err) {
            req.flash(
              "error_msg",
              "Houve um erro interno ao salvar a edição da categoria"
            );
            res.redirect("/admin/categorias");
          });
      })
      .catch(function(err) {
        req.flash("error_msg", "Houve um erro ao editar");
        req.redirect("/admin/categorias");
      });
  }
});

//----------------------------------------------------------------------------------------------
router.post("/categorias/delete/:id", eAdmin, (req, res) => {
  Categoria.deleteOne({ _id: req.params.id })
    .then(function() {
      req.flash("success_msg", "categoria deletada com sucesso");
      res.redirect("/admin/categorias");
    })
    .catch(function(err) {
      req.flash("erro_msg", "Houve um erro ao apagar");
      res.redirect("/admin/categorias");
    });
});

//----------------------------------------------------------------------------------------------

router.get("/postagens/add", eAdmin, function(req, res) {
  Categoria.find()
    .then(function(categorias) {
      res.render("admin/addpostagem", { categorias: categorias });
    })
    .catch(function(err) {
      req.flash("erro_msg", "Houve um erro ao carregar o formulario");
      res.redirect("/admin/postagens");
    });
});

router.get("/postagens", eAdmin, function(req, res) {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(function(postagens) {
      res.render("admin/postagens", { postagens: postagens });
    })
    .catch(function(err) {
      req.flash("error_msg", "Houve um erro ao listar as  postagens");
      res.redirect("/admin/postagens");
    });
});

router.post("/postagens/nova", eAdmin, function(req, res) {
  var erros = [];

  if (req.body.categoria == "0") {
    erros.push({ texto: "Categoria invalida, registre uma categoria" });
  }
  if (erros.length > 0) {
    res.render("admin/addpostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
      slug: req.body.slug
    };

    new Postagem(novaPostagem)
      .save()
      .then(function() {
        req.flash("success_msg", "Postagem criada com sucesso");
        res.redirect("/admin/postagens");
      })
      .catch(function(err) {
        req.flash(
          "error_msg",
          "Houve um erro durante o salvamento da postagem"
        );
        res.redirect("/admin/postagens");
      });
  }
});

// EDITANDO A POSTAGENS

router.get("/postagens/edit/:id", eAdmin, function(req, res) {
  Postagem.findOne({ _id: req.params.id })
    .then(function(postagem) {
      Categoria.find()

        .then(function(categorias) {
          res.render("admin/editpostagens", {
            categorias: categorias,
            postagem: postagem
          });
        })
        .catch(function(err) {
          req.flash("error_msg", "Houve um erro ao listar as categorias");
          res.redirect("/admin/postagens");
        });
    })
    .catch(function(err) {
      req.flash(
        "error_msg",
        "Houve um erro ao carregar o formulário de edição"
      );
      res.redirect("/admin/postagens");
    });
});

router.post("/postagens/edit", eAdmin, function(req, res) {
  Postagem.findOne({ _id: req.body.id })
    .then(function(postagem) {
      postagem.titulo = req.body.titulo;
      postagem.slug = req.body.slug;
      postagem.descricao = req.body.descricao;
      postagem.conteudo = req.body.conteudo;
      postagem.categoria = req.body.categoria;

      postagem
        .save()
        .then(function() {
          req.flash("success_msg", "Postagem editada com sucesso");
          res.redirect("/admin/postagens");
        })
        .catch(function(err) {
          req.flash("error_msg", "erro interno");
          res.redirect("/admin/postagens");
        });
    })
    .catch(function(err) {
      req.flash("error_msg", "Houve erro ao salvar a edição");
      res.redirect("/admin/postagens");
    });
});

router.get("/postagens/deletar/:id", eAdmin, function(req, res) {
  Postagem.remove({ _id: req.params.id })
    .then(function() {
      req.flash("success_msg", "Postagem deletada com sucesso!");
      res.redirect("/admin/postagens");
    })
    .catch(function(err) {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/admin/postagens");
    });
});

module.exports = router;
