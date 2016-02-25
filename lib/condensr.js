// CondensrJS
var AWS = require('aws-sdk');
var gcloud = require('gcloud');
var http = require('http');
var fs = require('fs');
var clientConfig = {};
Condensr = {};
Condensr.resData = {};

Condensr.condense = function (options, callback) {
    //options should be
    // {
    //   uploadType: 'aws' || 'gcloud',
    //   fileUrl: fileUrl,
    //   destinationName: destinationName
    //   acl: optional, 'public-read' as default in the list of aws canned acl (http://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html)
    // }
    var fileName = (options.fileUrl.split("/").pop()).replace(/[|&;$%@"<>'()+,]/g, "");
    var file = fs.createWriteStream(fileName);
    http.get(options.fileUrl, function(response) {
        var stream = response.pipe(file);
        stream.on('finish', function() {
            Condensr.upload(fileName, options, callback)
        })
    }).on('error', function(error) {
        return ("Got error retrieving file: " + error.message);
    });

};

Condensr.setClientOptions = function (clientOptions) {
    //clientOptions should be like:
    // {
    //  aws: {
    //      accessKeyId: 'akid',
    //      secretAccessKey: 'secret',
    //      region: 'us-west-1',
    //      bucket: bucket_name
    //      },
    //  gcloud: {
    //           projectId:projectId,
    //           keyFile: path to key.json  //describes the path to the particular key type needed,
    //           bucket: bucket_name
    //          }
    // }
    clientConfig = clientOptions;
    if (clientConfig.aws) {
        AWS.config.update({
            accessKeyId: clientConfig.aws.accessKeyId,
            secretAccessKey: clientConfig.aws.secretAccessKey,
            region: clientConfig.aws.region
        });
    }
    if (clientConfig.gcloud) {
        gcloud = gcloud({
            projectId: clientConfig.gcloud.projectId,
            keyFilename: clientConfig.gcloud.keyFile
        });
    }
};


Condensr.upload = function (fileName, options, callback) {
    options.destinationName = options.destinationName || fileName;

    var fileBuffer = fs.readFileSync(fileName);
    if (options.uploadType == 'aws' && clientConfig.aws) {
        Condensr.s3upload(fileBuffer, fileName, options, callback);
    }
    else if (options.uploadType == 'gcloud' && clientConfig.gcloud) {
        Condensr.gcloudUpload(fileName, options, callback);
    }
    else {
        return "upload type not supported";
    }
};

Condensr.cleanUp = function (fileName) {
    fs.unlink(fileName, function(err) {
        if (err) throw err;
    });
};

Condensr.s3upload = function (fileBuffer, fileName, options, callback) {
    var s3 = new AWS.S3({params: {Bucket: clientConfig.aws.bucket}});
    var s3PutOptions = {
        ACL: options.acl || 'private',
        Key: options.destinationName,
        Body: fileBuffer
    };

    s3.putObject(s3PutOptions, function (perr, pres) {
        if (perr) {
            return callback(perr, null);
        } else {
            Condensr.cleanUp(fileName);
            var objectUrl = 's3-' + clientConfig.aws.region + '.amazonaws.com/' + clientConfig.aws.bucket + '/' + options.destinationName;
            Condensr.resData = {
                res: pres,
                url: objectUrl
            };
            return callback(null, Condensr.resData);
        }
    });
};

Condensr.gcloudUpload = function (fileName, options, callback) {
    var storage = gcloud.storage();
    var bucket = storage.bucket(clientConfig.gcloud.bucket);

    bucket.upload(fileName, {destination: options.destinationName}, function (err, file) {
        if (err) {
            return callback(err, null);
        } else {
            Condensr.cleanUp(fileName);
            Condensr.resData = {
                res: file.metadata
            };
            return callback(null, Condensr.resData);
        }
    });
};

exports.setClientOptions = Condensr.setClientOptions;
exports.condense = Condensr.condense;
