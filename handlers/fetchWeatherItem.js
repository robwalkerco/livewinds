import { DynamoDB } from 'aws-sdk'
import weatherTransformer from '../transformers/weather'

const dynamoDb = new DynamoDB.DocumentClient()

const handler = (event, context, callback) => {
  const station = event.pathParameters.station
  const timestamp = event.pathParameters.timestamp

  // PROCESS
  const params = {
    TableName: process.env.DYNAMODB_WEATHER_TABLE,
    Key: {
      station,
      timestamp: parseInt(timestamp, 10),
    },
  }
  return dynamoDb.get(params, (error, data) => {
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
    else if (!data.Item) {
      response = {
        statusCode: 404,
        body: JSON.stringify({
          message: `No weather found for station:'${station}' timestamp:'${timestamp}'`,
          code: 'no_matching_weather',
        }),
      }
    }
    else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          data: weatherTransformer(station, data.Item),
        }),
      }
    }

    return callback(null, response)
  })
}

export default handler
