import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

const handler = (event, context, callback) => {
  const maxMinutes = 600
  const defaultMinutes = 100

  // VALIDATE

  let validationError

  // Check the requestes minutes are not greater than the default
  if (event.queryStringParameters.minutes && event.queryStringParameters.minutes > maxMinutes) {
    validationError = {
      statusCode: 400,
      body: JSON.stringify({
        message: `Param 'minutes' must not be greater that ${maxMinutes}`,
      }),
    }
  }

  // Check the station is set
  if (!event.queryStringParameters.station) {
    validationError = {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Param \'station\' is required',
      }),
    }
  }

  if (validationError) {
    return callback(null, validationError)
  }

  // PROCESS
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    KeyConditionExpression: '#station = :station',
    ExpressionAttributeNames: {
      '#station': 'station',
    },
    ExpressionAttributeValues: {
      ':station': event.queryStringParameters.station,
    },
    Limit: event.queryStringParameters.minutes || defaultMinutes,
    ScanIndexForward: true,
  }
  return dynamoDb.query(params, (error, data) => {
    let response

    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error,
        }),
      }
    }
    else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          data: data.Items,
        }),
      }
    }

    return callback(null, response)
  })
}

export default handler
