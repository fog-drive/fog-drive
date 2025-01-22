// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
// import { StorageModel } from '@shared/models'
// import { Readable } from 'stream'

/**
 * client-s3: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/
 * Qiniu: https://developer.qiniu.com/kodo/12558/aws-sdk-javascript-examples
 */
// const getClient = async (): Promise<[S3Client, string]> => {
//   const model: StorageModel = await getStorageById(4)
//   return [
//     new S3Client({
//       region: model.region,
//       endpoint: model.endpoint,
//       credentials: {
//         accessKeyId: model.accessKey,
//         secretAccessKey: model.secretKey
//       }
//     }),
//     model.bucket
//   ]
// }

// export async function put(key: string, input: Readable): Promise<void> {
//   const [s3, bucket] = await getClient()
//   s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: input }))
//     .then((data) => console.log(data))
//     .catch((err) => console.error(err))
// }
