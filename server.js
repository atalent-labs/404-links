const express = require('express')
const bodyParser = require('body-parser')
const { execSync } = require('child_process')
const uuidv1 = require('uuid/v1')
const _404 = require('./src')
const path = require('path')
const fs = require('fs')

const options = {
  folder: process.argv[2] || '.',
  ignore: [],
  port: process.env.PORT || 8080
}

express()
  .use(bodyParser.json())
  .get('/', (req, res) => {
    res.send(1)
  })
  .post('/repo', async (req, res) => {
    const config = {
      ...options,
      ...req.body
    }

    const tmpfolder = path.join('/tmp/', uuidv1())
    execSync(`git clone ${config.repository} ${tmpfolder}`)

    config.folder = path.join(tmpfolder, config.folder)

    const links = _404(config)
    links.on('end', (result) => {
      res.json(result)
      console.log('deleting folder: ', config.folder)
      fs.rmdirSync(config.folder, { recursive: true })
    })
  })
  .listen(options.port, () => {
    console.log('serving api on port', options.port)
  })
