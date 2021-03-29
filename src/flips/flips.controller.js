const flips = require("../data/flips-data");
const counts = require("../data/counts-data");

// Helper functions and data --------------------------------------------------

let lastFlipId = flips.reduce(
  (maxId, flipObj) => Math.max(maxId, flipObj.id),
  0
);

// Additive middleware functions ----------------------------------------------

// New middleware function to validate the request body
const bodyHasResultProperty = (req, res, next) => {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next(); // Call `next()` without an error message if the result exists
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
};

const resultPropertyisValid = (req, res, next) => {
  const { data: {result} = {} } = req.body;
  const validResults = ["heads", "tails", "edge"];
  if (validResults.includes(result)) {
    return next();
  } else {
    next({
      status: 400,
      message: `The value of 'result' must be one of [${validResults}]. Received: ${result}`
    })
  }
};

const specifiedFlipExists = (req, res, next) => {
  const { id } = req.params;
  const flip = flips.find((flip) => flip.id === +id);

  if (flip) {
    return next();
  } else {
    next({
      status: 404,
      message: `Flip id not found: ${id}`,
    });
  }
}

// Route handler functions ----------------------------------------------------

// POST "/flips"
function create(req, res) {
  const { data: { result } = {} } = req.body;
  const newFlip = {
    id: ++lastFlipId, // Increment last id then assign as the current ID
    result,
  };
  flips.push(newFlip);
  counts[result] = counts[result] + 1;
  res.status(201).json({ data: newFlip });
}

// GET "/flips"
const list = (req, res) => {
  res.json({ data: flips });
};

// GET "/flips/:id"
const read = (req, res) => {
  const { id } = req.params;
  const flip = flips.find((flip) => flip.id === +id);
  res.json({ data: flip });
}

// PUT "/flips/:id"
const update = (req, res) => {
  const { id } = req.params;
  const foundFlip = flips.find((flip) => flip.id === +id);

  const originalResult = foundFlip.result;
  const { data: { result } = {} } = req.body;

  if (originalResult !== result) {
    foundFlip.result = result;
    counts[originalResult] = counts[originalResult] - 1;
    counts[result] = counts[result] + 1;
  }

  res.json({ data: foundFlip });
}

// DELETE "/flips/:id"
const destroy = (req, res) => {
  const { id } = req.params;
  const index = flips.findIndex(flip => flip.id === +id);

  const deletedFlips = flips.splice(index, 1);
  deletedFlips.forEach(deletedFlip => counts[deletedFlip.result] = counts[deletedFlip.result] - 1)

  res.sendStatus(204);
}

module.exports = {
  list,
  create: [bodyHasResultProperty, resultPropertyisValid, create],
  read: [specifiedFlipExists, read],
  update: [specifiedFlipExists, bodyHasResultProperty, resultPropertyisValid, update],
  delete: [specifiedFlipExists, destroy],
};
