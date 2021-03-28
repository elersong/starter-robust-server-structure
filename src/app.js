const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

let lastFlipId = flips.reduce(
  (maxId, flipObj) => Math.max(maxId, flipObj.id),
  0
);

app.use(express.json());

// New middleware function to validate the request body
function bodyHasResultProperty(req, res, next) {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next(); // Call `next()` without an error message if the result exists
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
}

// TODO: Follow instructions in the checkpoint to implement ths API.
app.use("/counts", (req, res, next) => {
  res.json({ data: counts });
});

app.get("/flips", (req, res, next) => {
  res.json({ data: flips });
});

app.post("/flips", bodyHasResultProperty, (req, res, next) => {
  const { data: { result } = {} } = req.body;

  const newFlip = {
    id: ++lastFlipId, // Increment last id then assign as the current ID
    result,
  };

  flips.push(newFlip);
  counts[result] = counts[result] + 1; // Increment the counts
  res.status(201).json({ data: newFlip });
});

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
