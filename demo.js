/**
 * Created by timfulmer on 7/10/16.
 */
var AWS=require('aws-sdk');
AWS.config.update({region:'us-east-1'});
var cloudFormation=new AWS.CloudFormation(),
  templateBody={
    "Resources": {
      "VPC": {
        "Type": "AWS::EC2::VPC",
        "Properties": {
          "CidrBlock": "10.0.0.0/16",
          "Tags": [{"Key": "Application", "Value": {"Ref": "AWS::StackId"}}]
        }
      },
      "Subnet": {
        "Type": "AWS::EC2::Subnet",
        "Properties": {
          "VpcId": {"Ref": "VPC"},
          "CidrBlock": "10.0.0.0/24",
          "Tags": [{"Key": "Application", "Value": {"Ref": "AWS::StackId"}}]
        }
      },
      "InternetGateway": {
        "Type": "AWS::EC2::InternetGateway",
        "Properties": {
          "Tags": [{"Key": "Application", "Value": {"Ref": "AWS::StackId"}}]
        }
      },
      "AttachGateway": {
        "Type": "AWS::EC2::VPCGatewayAttachment",
        "Properties": {
          "VpcId": {"Ref": "VPC"},
          "InternetGatewayId": {"Ref": "InternetGateway"}
        }
      },
      "RouteTable": {
        "Type": "AWS::EC2::RouteTable",
        "Properties": {
          "VpcId": {"Ref": "VPC"},
          "Tags": [{"Key": "Application", "Value": {"Ref": "AWS::StackId"}}]
        }
      },
      "SubnetRouteTableAssociation": {
        "Type": "AWS::EC2::SubnetRouteTableAssociation",
        "Properties": {
          "SubnetId": {"Ref": "Subnet"},
          "RouteTableId": {"Ref": "RouteTable"}
        }
      },
      "NAT": {
        "DependsOn": "AttachGateway",
        "Type": "AWS::EC2::NatGateway",
        "Properties": {
          "AllocationId": {"Fn::GetAtt": ["EIP", "AllocationId"]},
          "SubnetId": {"Ref": "Subnet"}
        }
      },
      "EIP": {
        "Type": "AWS::EC2::EIP",
        "Properties": {
          "Domain": "vpc"
        }
      },
      "Route": {
        "Type": "AWS::EC2::Route",
        "Properties": {
          "RouteTableId": {"Ref": "RouteTable"},
          "DestinationCidrBlock": "0.0.0.0/0",
          "NatGatewayId": {"Ref": "NAT"}
        }
      },
      "ConsumerApplication" : {
        "Type" : "AWS::ElasticBeanstalk::Application",
        "Properties" : {
          "Description" : "AutoDeployed JSON Web Token Consumer Application"
        }
      },
      "ConsumerApplicationVersion" : {
        "Type" : "AWS::ElasticBeanstalk::ApplicationVersion",
        "Properties" : {
          "Description" : "Version 1.0",
          "ApplicationName" : { "Ref" : "ConsumerApplication" },
          "SourceBundle" : {
            "S3Bucket" : "jsonwebtoken-demo",
            "S3Key" : "consumer.zip"
          }
        }
      },
      "ConsumerConfigurationTemplate" : {
        "Type" : "AWS::ElasticBeanstalk::ConfigurationTemplate",
        "Properties" : {
          "ApplicationName" : { "Ref" : "ConsumerApplication" },
          "Description" : "Node.JS Application",
          "SolutionStackName" : "64bit Amazon Linux 2016.03 v2.1.3 running Node.js"
        }
      },
      "ConsumerEnvironment" : {
        "Type" : "AWS::ElasticBeanstalk::Environment",
        "Properties" : {
          "Description" :  "AutoDeployed JSON Web Token Consumer Environment",
          "ApplicationName" : { "Ref" : "ConsumerApplication" },
          "TemplateName" : { "Ref" : "ConsumerConfigurationTemplate" },
          "VersionLabel" : { "Ref" : "ConsumerApplicationVersion" }
        }
      },

      "ProducerApplication" : {
        "Type" : "AWS::ElasticBeanstalk::Application",
        "Properties" : {
          "Description" : "AutoDeployed JSON Web Token Producer Application"
        }
      },
      "ProducerApplicationVersion" : {
        "Type" : "AWS::ElasticBeanstalk::ApplicationVersion",
        "Properties" : {
          "Description" : "Version 1.0",
          "ApplicationName" : { "Ref" : "ProducerApplication" },
          "SourceBundle" : {
            "S3Bucket" : "jsonwebtoken-demo",
            "S3Key" : "producer.zip"
          }
        }
      },
      "ProducerConfigurationTemplate" : {
        "Type" : "AWS::ElasticBeanstalk::ConfigurationTemplate",
        "Properties" : {
          "ApplicationName" : { "Ref" : "ProducerApplication" },
          "Description" : "Node.JS Application",
          "SolutionStackName" : "64bit Amazon Linux 2016.03 v2.1.3 running Node.js"
        }
      },
      "ProducerEnvironment" : {
        "Type" : "AWS::ElasticBeanstalk::Environment",
        "Properties" : {
          "Description" :  "AutoDeployed JSON Web Token Producer Environment",
          "ApplicationName" : { "Ref" : "ProducerApplication" },
          "TemplateName" : { "Ref" : "ProducerConfigurationTemplate" },
          "VersionLabel" : { "Ref" : "ProducerApplicationVersion" }
        }
      }
    },
    "Outputs" : {
      "ProducerURL" : {
        "Description": "Endpoint URL of the producer ElasticBeanstalk instance",
        "Value" : { "Fn::GetAtt" : [ "ConsumerEnvironment", "EndpointURL" ]}
      },
      "ConsumerURL" : {
        "Description": "Endpoint URL of the consumer ElasticBeanstalk instance",
        "Value" : { "Fn::GetAtt" : [ "ProducerEnvironment", "EndpointURL" ]}
      }
    }
  },
  template={
    "StackName": "DemoStack3",
    "TemplateBody":JSON.stringify(templateBody)
  };
function checkStack(){
  cloudFormation.describeStacks({StackName:"DemoStack3"},function(err,data){
    if(err){
      return console.log('Error querying CloudFormation stack:\n%s',err.stack);
    }
    if(data.Stacks[0].StackStatus!=='CREATE_COMPLETE'){
      return setTimeout(checkStack,30000);
    }
    console.log('Retrieved stack information:\n%s',JSON.stringify(data,null,2));
  });
}
cloudFormation.createStack(template,function(err, data){
  if(err){
    return console.log('Error creating CloudFormation stack:\n%s',err.stack);
  }
  console.log('Created CloudFormation stack:\n%s',JSON.stringify(data,null,2));
  checkStack();
});