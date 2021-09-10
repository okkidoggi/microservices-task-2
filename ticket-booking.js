'use strict'
const status = require('http-status')

module.exports = ({repo}, app) => {
  app.post('/booking', (req, res, next) => {
    
    // we grab the dependencies need it for this route
    const validate = req.container.resolve('validate')
    const paymentService = req.container.resolve('paymentService')
    const currencyService = req.container.resolve('currencyService')

    Promise.all([
      validate(req.body.booking, 'booking')
    ])
    .then(([booking]) => {
      const payment = {
        currency: 'sgd',
        amount: booking.amount,
        description: `
          Tickect(s) for movie ${booking.movie},
          at Cinema Room ${booking.cinemaRoom}
      }

      return Promise.all([
        paymentService(payment),
        Promise.resolve(booking)
      ])
    })
    .then(([paid, booking]) => {
      return Promise.all([
        repo.makeBooking(booking),
        repo.generateTicket(paid, booking)
      ])
    })
    .then(([booking, ticket]) => {
      currencyService({booking})
      res.status(status.OK).json(ticket)
    })
    .catch(next)
  })

  app.get('/booking/verify/:orderId', (req, res, next) => {
    repo.getOrderById(req.params.orderId)
      .then(order => {
        res.status(status.OK).json(order)
      })
      .catch(next)
  })
}
