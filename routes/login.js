import express from "express";
import BD from "../db.js";

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("admin/login");
});

router.post("/login", async (req, res) => {
  const { usuario, senha } = req.body;
  const buscaDados = await BD.query(
    "SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2",
    [usuario, senha]
  );

  if (buscaDados.rows.length > 0) {

    const user = buscaDados.rows[0];

    if (!user.ativo) 
    {
      res.render("admin/login", {
      mensagem: "Usuário inativo.",
      });
    }
    else
    {
      req.session.usuarioLogado = user.usuario;
      req.session.nomeUsuario = user.nome;
      req.session.idUsuario = user.id_usuario;
      req.session.is_admin = user.is_admin
      res.redirect("/admin/");
    }
  
  } else {
    res.render("admin/login", {
      mensagem: "Usuário não autenticado, tente novamente.",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

export default router;
