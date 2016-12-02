const express = require('express'),
      helmet = require('helmet'),
      hsts = require('hsts'),
      csp = require('helmet-csp'),
      bodyParser = require('body-parser'),
      request = require('request'),
      async   = require('async'),
      util = require('util'),
      morgan = require('morgan');

var app = express();

app.use(morgan('dev'))
app.use(helmet());
app.use(hsts({
  maxAge: 15552000,  // 180 days
  setIf: function (req, res) {
    // for the nginx reverse proxy
    return req.secure || (req.headers['x-forwarded-proto'] === 'https')
  }
}));

app.use(csp (
    {
      directives: {
        defaultSrc: ["'none'"],
        imgSrc: ["'self'"],
        scriptSrc: ["'self'", "https://ajax.googleapis.com/ajax/libs/angularjs/", "'unsafe-eval'"], // Angularjs problem!
        styleSrc: ["'self'", "https://netdna.bootstrapcdn.com/bootstrap/", "'sha256-1PxuDsPyGK6n+LZsMv0gG4lMX3i3XigG6h0CzPIjwrE='" ],
        fontSrc: ["https://netdna.bootstrapcdn.com/bootstrap/"],
        connectSrc: ["'self'"],
        reportUri: "https://e49ac078adcc8bebde9ae6eaf2766663.report-uri.io/r/default/csp/enforce"
      },

      reportOnly: false
    }
  )
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.get("/search", function(req,res){
  res.sendFile("./public/home.html",{ root: __dirname });
});

app.get("*",function(req,res){
  res.redirect("/search");
});

/*
  To avoid the CORS issues with the frontend querying of domcomp
  This api queries them and returns the dictionary blob;
*/
app.post("/domains", function(req, res) {
  console.log('querying domains like: %s.%s'
                ,req.body.list[0],req.body.tld);

  var dict = {};
  var tld = req.body.tld;
  req.body.list.map(x => dict[x] = true);
  var domains = Object.keys(dict);

  async.each(domains,function(domain,cb){
    request(util.format("https://www.domcomp.com/research1?q=%s&tld=%s", domain, tld), function (error, response, body) {
      if (!error && response.statusCode == 200) {
        dict[domain] = JSON.parse(body).result.registered;
      }
      cb();
    })
  },function(err){
      if(!err)
        return res.json(dict);

      console.log(err);
  });

});

// Catch other stuff and deny.
app.use(function(err, req, res, next) {
    if(err){
      console.log(err)
      res.redirect(403,"back");
    }
});

var port = 3000;

app.listen(port, function () {
  console.log('Listening on port: ' + port);
})
