import { DynamoDB } from 'aws-sdk'
import weatherTransformer from '../transformers/weather'

const dynamoDb = new DynamoDB.DocumentClient()

const handler = (event, context, callback) => {
  const station = event.pathParameters.station
  const maxMinutes = 600
  const defaultMinutes = 100

  // VALIDATE

  let validationError

  // Check the requestes minutes are not greater than the default
  if (
    event.queryStringParameters &&
    event.queryStringParameters.minutes &&
    event.queryStringParameters.minutes > maxMinutes
  ) {
    validationError = {
      statusCode: 400,
      body: JSON.stringify({
        message: `Param 'minutes' must not be greater that ${maxMinutes}`,
        code: 'param_error',
      }),
    }
  }

  if (validationError) {
    return callback(null, validationError)
  }

  // PROCESS
  const params = {
    TableName: process.env.DYNAMODB_WEATHER_TABLE,
    KeyConditionExpression: '#station = :station',
    ExpressionAttributeNames: {
      '#station': 'station',
    },
    ExpressionAttributeValues: {
      ':station': station,
    },
    Limit: (event.queryStringParameters && event.queryStringParameters.minutes) || defaultMinutes,
    ScanIndexForward: true,
  }
  return dynamoDb.query(params, (error, data) => {
    let response

    if (error) {
      response = {
        statusCode: 500,
        body: JSON.stringify({
          message: error,
          code: 'system_error',
        }),
      }
    }
    else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          data: data.Items.map(weather => weatherTransformer(station, weather)),
        }),
      }
    }

    return callback(null, response)
  })
}

export default handler
