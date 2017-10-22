const weatherTransformer = (station, weather) => ({
  ...weather,
  _links: {
    self: {
      href: `${process.env.FULL_PATH}/v1/stations/${station}/weather/${weather.timestamp}`,
    },
    station: {
      href: `${process.env.FULL_PATH}/v1/stations/${station}`,
    },
  },
})

export default weatherTransformer
