module.exports = function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.end('{"foo":"bar"}');
}