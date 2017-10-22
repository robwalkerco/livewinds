import { DynamoDB } from 'aws-sdk'
import stationTransformer from '../transformers/station'

const dynamoDb = new DynamoDB.DocumentClient()

const handler = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_STATIONS_TABLE,
  }
  return dynamoDb.scan(params, (error, data) => {
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
          data: data.Items.map(item => stationTransformer(item)),
        }),
      }
    }

    return callback(null, response)
  })
}

export default handler
