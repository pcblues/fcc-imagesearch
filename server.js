// server.js
// where your node app starts

var collName='imagesearch'
var urlPrefix='https://fcc-iimagesearch.glitch.me/'
var dbName = 'fcc-iimagesearch'
var fnUrlNum='urlNum'
var fnUrl='url'

// init project
var express = require('express')
var app = express()
var mongo=require('mongodb').MongoClient
var searcher =require('./searcher')
var recLimit = 10

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'))



// http://expressjs.com/en/starter/basic-routing.html
app.get("/api/imagesearch/:term", function (request, response) {
  var url = process.env.MONGODB_URL
  console.log('Search')
  var req = request.url
  var doTerm = decodeURI(request.params.term)
  var doOffset = request.query.offset
  console.log(doTerm)
  console.log(doOffset)
  
  mongo.connect(url,{useNewUrlParser:true},function(err,db) {
    if (err) {response.send(JSON.stringify(err))} 

    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    
    var newDocObj = {"term":doTerm,"when":(new Date).toISOString()}
    var newUrl =""
    coll.insert(newDocObj,function(err,data) {
    if (err) {response.send(JSON.stringify(err))} 

    db.close()
    
    var searchResults = searcher.doSearch(doTerm,doOffset)
    
    response.send(JSON.stringify(searchResults))
    })

})
})


app.get("/api/latest/imagesearch",function (request,response) {
  
  var url = process.env.MONGODB_URL  
  
  mongo.connect(url,{useNewUrlParser:true},function(err,db) {
    if (err) { response.send(JSON.stringify(err)) } 
    // get url associated with link
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    
    coll.find({},{fields:{_id:0}}).sort({_id:-1}).limit(recLimit).toArray(function(err,docs){
          if (err) {response.send(JSON.stringify(err))}
          response.send(JSON.stringify(docs))
          db.close()
    
        })  
    })
  
})

app.get('/',function(request,response) {
  response.send('')
})

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
})
