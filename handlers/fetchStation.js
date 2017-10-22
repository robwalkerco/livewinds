import { DynamoDB } from 'aws-sdk'
import stationTransformer from '../transformers/station'

const dynamoDb = new DynamoDB.DocumentClient()

const handler = (event, context, callback) => {
  const station = event.pathParameters.station

  // PROCESS
  const params = {
    TableName: process.env.DYNAMODB_STATIONS_TABLE,
    Key: {
      station,
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
          message: `No station found for '${station}'`,
          code: 'no_matching_station',
        }),
      }
    }
    else {
      response = {
        statusCode: 200,
        body: JSON.stringify({
          data: stationTransformer(data.Item),
        }),
      }
    }

    return callback(null, response)
  })
}

export default handler
