/**
 * Created by timfulmer on 7/12/16.
 */
var restify=require('restify'),
  jwt=require('jsonwebtoken'),
  server=restify.createServer(),
  port=process.env.PORT || 3000;
server.get('/goodToken',function(req,res,next){
  var jws=jwt.sign({'/restricted':true}, 'secret');
  res.send({jws:jws});
  next();
});
server.get('/badToken',function(req,res,next){
  var jws=jwt.sign({'/restricted':false}, 'secret');
  res.send({jws:jws});
  next();
});
server.listen(port,function(){
  console.log('%s listening at %s', server.name, server.url);
});