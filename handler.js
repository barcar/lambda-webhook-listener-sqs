'use strict'
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs')

const sqs = new SQSClient({})

module.exports.webhook = async (event, context) => {
  console.log(JSON.stringify(event, null, 2))
  const { headers, body } = event

  // SQS only allows 10 message attributes so ignore some default headers
  const ignoreHeaders = [
    'Accept',
    'CloudFront-Forwarded-Proto',
    'CloudFront-Is-Desktop-Viewer',
    'CloudFront-Is-Mobile-Viewer',
    'CloudFront-Is-SmartTV-Viewer',
    'CloudFront-Is-Tablet-Viewer',
    'CloudFront-Viewer-Country',
    'Host',
    'User-Agent',
    'Via',
    'X-Amz-Cf-Id',
    'X-Amzn-Trace-Id',
    'X-Forwarded-Port',
    'X-Forwarded-Proto'
  ] // 'content-type', 'X-Forwarded-For'
  let attrib = {}
  for (const [key, value] of Object.entries(headers)) {
    if (!ignoreHeaders.includes(key))
      attrib[key] = {
        DataType: 'String',
        StringValue: value
      }
  }

  try {
    const params = {
      MessageBody: body,
      QueueUrl: process.env.AWS_SQS_QUEUE_URL,
      MessageAttributes: attrib
    }
    const result = await sqs.send(new SendMessageCommand(params))
    console.log(result)
    return {
      statusCode: 200
    }
  } catch (err) {
    console.log('SQS sendMessage error:', err)
    return {
      statusCode: 500
    }
  }
}
