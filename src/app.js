const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

const flipsRouter = require('./flips/flips.router');




app.use(express.json());



// TODO: Follow instructions in the checkpoint to implement ths API.
app.use("/counts", (req, res, next) => {
  res.json({ data: counts });
});

app.use("/flips", flipsRouter);



app.get("/flips/:id", (req, res, next) => {
  const { id } = req.params;
  const flip = flips.find((flip) => flip.id === +id);

  if (flip) {
    res.json({ data: flip });
  } else {
    next({
      status: 404,
      message: `Flip id not found: ${id}`,
    });
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

// Not found handler
app.use((request, response, next) => {
  next({
    status: 404,
    message: `Not found: ${request.originalUrl}`,
  });
});

// Error handler
app.use((error, request, response, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  response.status(status).json({ error: message });
});

module.exports = app;
