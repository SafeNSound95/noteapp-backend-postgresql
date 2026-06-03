const router = require("express").Router();

const { Note } = require("../models");

router.get("/", async (req, res) => {
  const notes = await Note.findAll();
  res.json(notes);
});

router.post("/", async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, date: new Date() });
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
