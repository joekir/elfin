const express = require('express'),
      helmet = require('helmet'),
      csp = require('helmet-csp');

var app = express();
app.use(helmet());
app.use(csp (
    {
      directives: {
        defaultSrc: ["'none'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'", "https://ajax.googleapis.com/ajax/libs/angularjs/", "'unsafe-eval'"], // Angularjs problem!
        styleSrc: ["https://netdna.bootstrapcdn.com/bootstrap/", "'sha256-1PxuDsPyGK6n+LZsMv0gG4lMX3i3XigG6h0CzPIjwrE='" ],
        fontSrc: ["https://netdna.bootstrapcdn.com/bootstrap/"],
        reportUri: "https://e49ac078adcc8bebde9ae6eaf2766663.report-uri.io/r/default/csp/reportOnly",
      },

      reportOnly: true
    }
  )
);

app.use(express.static(__dirname + '/public'));

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
