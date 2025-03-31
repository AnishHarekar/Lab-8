import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Create an S3 bucket for the static website
const bucket = new aws.s3.Bucket("my-static-website-bucket", {
    website: {
        indexDocument: "index.html",
    },
});

// Bucket Policy to allow public read access
const bucketPolicy = new aws.s3.BucketPolicy("my-bucket-policy", {
    bucket: bucket.id,
    policy: bucket.id.apply(bucketName => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
        }],
    })),
});

// Upload a sample index.html file to the bucket (no ACL)
const indexContent = `<html><body><h1>Hello from Pulumi Static Site!</h1></body></html>`;
const indexObject = new aws.s3.BucketObject("index.html", {
    bucket: bucket.id,
    content: indexContent,
    contentType: "text/html",
    // Removed acl: "public-read" since we use a bucket policy instead
});

// Create a CloudFront distribution
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
            restrictionType: "none",
        },
    },
});

// Exports
export const bucketName = bucket.id;
export const cloudfrontUrl = distribution.domainName;
