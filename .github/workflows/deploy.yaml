import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// S3 Bucket
const bucket = new aws.s3.Bucket("my-static-website-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

// S3 Object
const indexContent = `<html><body><h1>Hello from Pulumi Static Site!</h1></body></html>`;
const indexObject = new aws.s3.BucketObject("index.html", {
    bucket: bucket.id,
    content: indexContent,
    contentType: "text/html",
    acl: "public-read",
});

// CloudFront Distribution with 'restrictions'
const distribution = new aws.cloudfront.Distribution("my-distribution", {
    enabled: true,
    origins: [{
        domainName: bucket.bucketRegionalDomainName,
        originId: bucket.arn,
    }],
    defaultRootObject: "index.html",
    defaultCacheBehavior: {
        targetOriginId: bucket.arn,
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD", "OPTIONS"],
        cachedMethods: ["GET", "HEAD", "OPTIONS"],
        forwardedValues: {
            queryString: false,
            cookies: { forward: "none" },
        },
        minTtl: 0,
        defaultTtl: 3600,
        maxTtl: 86400,
    },
    priceClass: "PriceClass_100",
    viewerCertificate: {
        cloudfrontDefaultCertificate: true,
    },
    restrictions: {
        geoRestriction: {
            restrictionType: "none", // No geographic restrictions
        },
    },
});

// Exports
export const bucketName = bucket.id;
export const cloudfrontUrl = distribution.domainName;
