const http = require('http');
const express = require('express')
const httpProxy = require('express-http-proxy')
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const axios = require('axios').default
require('dotenv').config()

const app = express()
app.use(cookieParser())

const authProxy = httpProxy(process.env.AUTH_URL)
const credenciadoProxy = httpProxy(process.env.CREDENCIADO_URL, {
  proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
    proxyReqOpts.headers = {user: srcReq.user};
    return proxyReqOpts
  }
})

const authMiddleware = async (req, res, next) => {
  /* if (req.header('Authorization')) {
    await axios.post(process.env.AUTH_URL + '/decode', {
      token: req.header('Authorization').split(' ')[1]
    }).then(response => {
      req.user = { id: response.data.id }
    }).catch(error => {
      res.status(500).json({ message: error.message })
    })
  } */
  req.user = 1
  next()
}

app.use('/auth', authMiddleware, (req, res, next) => {
  authProxy(req, res, next)
})

app.use('/credenciado', authMiddleware, (req, res, next) => {
  credenciadoProxy(req, res, next)
})

app.use(logger('dev'))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const server = http.createServer(app)

let port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log("API rodando na porta " + port);
});