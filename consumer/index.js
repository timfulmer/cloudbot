/**
 * Created by timfulmer on 7/12/16.
 */
var restify=require('restify'),
  jwt=require('jsonwebtoken'),
  server=restify.createServer(),
  port=process.env.PORT || 3000;
server.use(restify.queryParser());
server.get('/restricted',function(req,res,next){
  var jws=req.params.jws,
    grants=jwt.verify(jws,'secret');
  if(!grants['/restricted']){
    res.send(403,'Restricted');
    return next();
  }
  res.send({ok:true});
  return next();
});
server.listen(port,function(){
  console.log('%s listening at %s', server.name, server.url);
});