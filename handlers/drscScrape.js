import { JSDOM } from 'jsdom'
import moment from 'moment'
import AWS from 'aws-sdk'

const dynamoDb = new AWS.DynamoDB.DocumentClient()

const sourceUrl = 'https://drsc.co.uk/'
const userAgent = 'livewinds.com wind spider'

const getWeatherSection = dom => dom.window.document.querySelector('.weather')

const getValueFor = (dom, key) =>
  getWeatherSection(dom)
    .querySelector(`[alt="${key}"]`)
    .parentNode.parentNode.querySelector('div:last-child').textContent

const getAverageWind = dom => Math.round(getValueFor(dom, 'Wind Speed').split(' ')[0])

const getGustWind = dom => Math.round(getValueFor(dom, 'Wind Speed').match(/- (\d+)/)[1])

const getTempValueFor = (dom, key) => Math.round(getValueFor(dom, key).replace('°C', ''))

const getUpdatedTime = dom =>
  moment()
    .seconds(0)
    .subtract(
      getWeatherSection(dom)
        .querySelector('a > p')
        .textContent.replace('Updated: ', '')
        .replace('minutes ago', ''),
      'minutes'
    )
    .unix()

const handler = (event, context, callback) => {
  JSDOM.fromURL(sourceUrl, { userAgent }).then(dom => {
    const doc = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        station: 'drsc',
        windDirection: getValueFor(dom, 'Wind Direction'),
        windSpeedAverage: getAverageWind(dom),
        windSpeedGust: getGustWind(dom),
        windSpeedUnit: 'mph',
        temperature: getTempValueFor(dom, 'Temperature'),
        feelsLike: getTempValueFor(dom, 'Feels Like'),
        tempUnit: 'celsius',
        timestamp: getUpdatedTime(dom),
      },
    }

    dynamoDb.put(doc, error => {
      // handle potential errors
      if (error) {
        return callback(process.env.DYNAMODB_TABLE)
      }

      callback(null, 'success')
    })
  })
  // const response = {
  //   statusCode: 200,
  //   body: JSON.stringify({
  //     message: 'Go Serverless v1.0! Your function executed successfully!',
  //     input: event,
  //   }),
  // }

  // callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, {
  //   message: 'Go Serverless v1.0! Your function executed successfully!',
  //   event,
  // })
}

export default handler
