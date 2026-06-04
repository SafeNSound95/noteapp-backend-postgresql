const router = require("express").Router();

const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const { Note } = require("../models");
const { User } = require("../models");

router.get("/", async (req, res) => {
  const notes = await Note.findAll({
    attributes: {
      exclude: ["userId"],
    },
    include: {
      model: User,
      attributes: ["name"],
    },
  });
  res.json(notes);
});

const tokenExtractor = (req, res, next) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), SECRET);
    } catch {
      return res.status(401).json({ error: "token invalid" });
    }
  } else {
    return res.status(401).json({ error: "token missing" });
  }
  next();
};

router.post("/", tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);
    const note = await Note.create({
      ...req.body,
      date: new Date(),
      userId: user.id,
    });
    res.json(note);
  } catch (error) {
    return res.status(400).json({ error });
  }
});

const noteFinder = async (req, res, next) => {
  req.note = await Note.findByPk(req.params.id);
  if (!req.note) {
    return res.status(404).end();
  }
  next();
};

router.get("/:id", noteFinder, async (req, res) => {
  res.json(req.note);
});

router.put("/:id", noteFinder, async (req, res) => {
  req.note.important = req.body.important;
  await req.note.save();
  res.json(req.note);
});

router.delete("/:id", noteFinder, async (req, res) => {
  await req.note.destroy();
  res.status(204).end();
});

module.exports = router;
