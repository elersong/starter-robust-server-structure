const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

let lastFlipId = flips.reduce((maxId, flipObj) => Math.max(maxId, flipObj.id), 0)

app.use(express.json());

// TODO: Follow instructions in the checkpoint to implement ths API.
app.use("/counts", (req, res, next) => {
  res.json({ data: counts });
});

app.get("/flips", (req, res, next) => {
  res.json({ data: flips });
});

app.post("/flips", (req, res, next) => {
  const { data: { result } = {} } = req.body;
  if (result) {
    const newFlip = {
      id: ++lastFlipId, // Increment last id then assign as the current ID
      result,
    };
    flips.push(newFlip);
    counts[result] = counts[result] + 1; // Increment the counts
    res.status(201).json({ data: newFlip });
  } else {
    res.sendStatus(400);
  }
});

app.use("/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count type not found: ${countId}`);
  } else {
    res.json({ data: foundCount });
  }
});

app.use("/flips/:id", (req, res, next) => {
  const { id } = req.params;
  const flip = flips.find((flip) => flip.id === +id);

  if (flip) {
    res.json({ data: flip });
  } else {
    next(`Flip id not found: ${id}`);
  }
});

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  response.send(error);
});

module.exports = app;
