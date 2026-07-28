// Wraps an async route handler so a rejected promise (e.g. a DB query that
// fails) is forwarded to Express's error handling instead of becoming an
// unhandled rejection that crashes the whole process.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
