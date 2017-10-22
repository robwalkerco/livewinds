const stationTransformer = station => ({
  ...station,
  _links: {
    self: {
      href: `${process.env.FULL_PATH}/v1/stations/${station.station}`,
    },
    collection: {
      href: `${process.env.FULL_PATH}/v1/stations`,
    },
    latest: {
      href: `${process.env.FULL_PATH}/v1/stations/${station.station}/latest`,
    },
  },
})

export default stationTransformer
