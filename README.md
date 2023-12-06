# Implementing S3 Bucket with antivirus capabilities

This repository introduces a practical solution for integrating ClamAV® into your existing AWS environment. By leveraging an AWS CDK construct, it seamlessly incorporates virus scanning for new objects in Amazon S3, allowing for effortless integration with various AWS services to trigger responsive actions based on the ClamAV scan results.

With this setup, your S3 bucket gains antivirus capabilities, providing an added layer of security for stored data. The included Lambda function takes care of the operational aspects, automatically deleting files labeled "INFECTED" and transferring "CLEAN" files to a designated S3 bucket. This streamlined approach not only fortifies your S3 bucket against potential threats but also simplifies the handling of compromised and clean files, offering a practical and adaptable solution for enhancing the overall security of your AWS environment.

