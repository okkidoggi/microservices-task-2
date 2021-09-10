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
        userName: user.name
        currency: 'sgd',
        amount: booking.amount,
        description: `
          Tickect(s) for movie ${booking.movie},
          at Cinema Room ${booking.cinemaRoom}
      }

      return Promise.all([
        // we call the payment service
        paymentService(payment),
        Promise.resolve(user),
        Promise.resolve(booking)
      ])
    })
    .then(([paid, user, booking]) => {
      return Promise.all([
        repo.makeBooking(user, booking),
        repo.generateTicket(paid, booking)
      ])
    })
    .then(([booking, ticket]) => {
      // we call the notification service
      notificationService({booking, ticket})
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
