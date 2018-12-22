const { parse } = require('url');

module.exports = function (req, res) {
  const { query } = parse(req.url, true);

  res.end('id=' + query.id);
}