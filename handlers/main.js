exports.handler = function(req) {
  req.reply.view('index.html', { name: 'Bob' });
};