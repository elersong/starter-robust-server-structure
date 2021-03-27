const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

// TODO: Follow instructions in the checkpoint to implement ths API.
app.use("/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count type not found: ${countId}`);
  } else {
    res.json({data: foundCount})
  }
})

app.use("/counts", (req, res, next) => {
  res.json({data: counts})
})

app.use("/flips/:id", (req, res, next) => {
  const { id } = req.params;
  const flip = flips.find(flip => flip.id === +id);

  if (flip) {
    res.json({data: flip})
  } else {
    next(`Flip id not found: ${id}`);
  }
});

app.use("/flips", (req, res, next) => {
  res.json({data: flips});
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
