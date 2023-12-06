import { S3Client, GetObjectTaggingCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsCommand } from "@aws-sdk/client-s3";

export const handler = async (event, context) => {
    const source_bucket = 'gamonavclamdest';
    const destination_bucket = 'avtestgamonclean';

    const S3 = new S3Client();

    try {
        const listObjectsResponse = await S3.send(new ListObjectsCommand({ // retrieves a list of objects from a specified Amazon S3 bucket.
            Bucket: source_bucket
        }));

        for (const obj of listObjectsResponse.Contents || []) {
            const key = obj.Key;

            const tagResponse = await S3.send(new GetObjectTaggingCommand({ //retrieves the tags associated with a specific object in an Amazon S3 bucket.
                Bucket: source_bucket,
                Key: key
            }));

            // Check if Tags array exists and is not empty
            if (tagResponse.TagSet && tagResponse.TagSet.length > 0) {
                const scanStatus = tagResponse.TagSet[0].Value;

                if (scanStatus === 'CLEAN') {
                    const destinationKey = key;
                    await S3.send(new CopyObjectCommand({ //copies "CLEAN" files from a source location to a different Amazon S3 bucket.
                        Bucket: destination_bucket,
                        CopySource: `${source_bucket}/${key}`,
                        Key: destinationKey
                    }));

                    console.log(`File ${key} copied to ${destination_bucket}`);
                } else if (scanStatus === 'INFECTED') {
                    await S3.send(new DeleteObjectCommand({ Bucket: source_bucket, Key: key })); //deletes "INFECTED" files from Amazon S3 with scanning capabilities.

                    console.log(`Infected file ${key} deleted from ${source_bucket}`);
                }
            }
        }

        return {
            statusCode: 200,
            body: 'Clean files copied and infected files deleted successfully.'
        };
    } catch (error) {
        console.error('Error processing files:', error);

        return {
            statusCode: 500,
            body: 'Error processing files. Check CloudWatch logs for details.'
        };
    }
};
