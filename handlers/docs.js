const handler = (event, context, callback) => {
  const stationArg = {
    required: true,
    description: 'The unique code of the station',
    type: 'string',
  }
  const timestampArg = {
    required: true,
    description: 'The unix timestamp of the weather item',
    type: 'number',
  }
  const minutesArg = {
    required: false,
    default: 100,
    description: 'The number of items to return. One item per minute',
    type: 'number',
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      routes: {
        'v1/stations': {
          methods: ['GET'],
          endpoints: [
            {
              methods: ['GET'],
              args: {},
            },
          ],
        },
        'v1/stations/{station:[w]+}': {
          methods: ['GET'],
          endpoints: [
            {
              methods: ['GET'],
              args: {
                station: stationArg,
              },
            },
          ],
        },
        'v1/stations/{station:[w]+}/latest': {
          methods: ['GET'],
          endpoints: [
            {
              methods: ['GET'],
              args: {
                station: stationArg,
                minutes: minutesArg,
              },
            },
          ],
        },
        'v1/stations/{station:[w]+}/weather/{timestamp:[d]+}': {
          methods: ['GET'],
          endpoints: [
            {
              methods: ['GET'],
              args: {
                station: stationArg,
                timestamp: timestampArg,
              },
            },
          ],
        },
      },
    }),
  }

  return callback(null, response)
}

export default handler
