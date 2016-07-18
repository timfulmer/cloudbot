#JWS + CloudFormation Demo

- Build the JWS producer
- Build the JWS consumer
- Upload build artifacts to s3
- Run the demo deployment
- Access restricted resource

## Build the JWS producer

```
cd producer
zip ~/Desktop/producer.zip index.js package.json
```

## Build the JWS consumer

```
cd consumer
zip ~/Desktop/consumer.zip index.js package.json
```

## Upload build artifacts to s3

Login to the s3 console, and upload the `producer` and `consumer` apps to an s3
bucket.  Modify the s3 bucket name defined in `demo.js` to match the bucket the
 producer and consumer apps were run

## Run the demo deployment

Follow the instructions here to setup the AWS Node.JS SDK

http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html

Run `node demo.js`

## Access restricted resource

The producer endpoints are

http://{{ProducerURL}}/goodToken
http://{{ProducerURL}}/badToken

The consumer endpoint is

http://{{ConsumerURL}}/restricted?jws={{token}}

Where {{ProducerURL}} and {{ConsumerURL}} both come from the output of
`demo.js`.  {{token}} is from the producer response

The consumer endpoint will allow access with the good token, and return a 403
for the bad token