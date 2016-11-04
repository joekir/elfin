const express = require('express'),
      helmet = require('helmet'),
      csp = require('helmet-csp');

var app = express();
app.use(express.static(__dirname + '/public'));

app.use(helmet());
app.use(csp (
    {
      directives: {
        defaultSrc: ["'none'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'", "//ajax.googleapis.com", "//netdna.bootstrapcdn.com"]
      }
    }
  )
);

app.get("*", function(req,res){
  res.sendFile("./public/index.html");
});

// Catch other stuff and deny.
app.use(function(err, req, res, next) {
    res.redirect(403,"back");
});

var port = 3000;

app.listen(port, function () {
  console.log('Listening on port: ' + port);
})
