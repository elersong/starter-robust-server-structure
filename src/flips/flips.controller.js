const flips = require("../data/flips-data");

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

// Route handler functions ----------------------------------------------------

const create = (req, res) => {
  const { data: { result } = {} } = req.body;
  const newFlip = {
    id: ++lastFlipId, // Increment last id then assign as the current ID
    result: result,
  };
  flips.push(newFlip);
  res.status(201).json({ data: newFlip });
};

const list = (req, res) => {
  res.json({ data: flips });
};

module.exports = {
  list,
  create: [bodyHasResultProperty, resultPropertyisValid, create],
};
