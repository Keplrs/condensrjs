# condensrjs
Useful for safely securing cloud resources on cloud hosts.

## Use case
Consider having a url to a file, say http://picture.jpg. With CondensrJS you can directly save this file into your cloud or remote storage.

## How to Condense a file
* Install CondensrJS with `npm install condensrjs` 
* Initialize with;
```
var condensr = require("condensrjs");
```

* Set up storage parameters. Presently, there is support for Amazon S3 and Google Cloud Storage, you should only configre the services you want to use. You can use as many services as you want at a time.
Typical configuration looks like;
```
clientOptions = {
        aws:  {
              accessKeyId: 'akid',   // AWS bucket secret key
              secretAccessKey: 'secret',  // AWS bucket Access key
              region: 'us-west-1',     // Region of the storage bucket
              bucket: 'bucket_name'   //  The name of the bucket to use
              },
      gcloud: {
               projectId: 'projectId',    // Google cloud project ID
               keyFile: path to key.json  // This should point to the path of a Google cloud service account JSON key
               bucket: 'bucket_name'      // The name of the bucket to use
              }
      }
condensr.setClientOptions(clientOptions);
```
* After setting up this configuration, you are ready to condense those files into your storage. The general format is;
```
condensr.condense(options, callback(erorr, data));
```
Options is set as;
```
options = {
             uploadType: 'aws' || 'gcloud', // Set aws if you want to use the AWS-S3 bucket or gcloud if you want to use the Google cloud service
             fileUrl: 'fileUrl', // This points to the url of the file in question e.g. http://picture.jpg
             destinationName: 'destinationName', // Give the name you want the file to take on the cloud storage. If not supplied, takes the file name as default.
             acl: 'acl' // Set the permission for ths file. Applies only to AWS storage, and takes a default of 'private'
         }
```
Please refere to the list of [aws canned acl](http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html)
* The result data typically contains meta-data of the file uploaded. You can get access to the new link of the file in the response data.
