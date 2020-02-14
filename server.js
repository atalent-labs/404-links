const express = require('express')
const bodyParser = require('body-parser')
const { execSync } = require('child_process');
const uuidv1 = require('uuid/v1')
const _404 = require('./src')
const path = require('path')
const fs = require('fs')

const options = {
  folder : process.argv[2] || '.',
  ignore: [],
}

express()
  .use(bodyParser.json())
  .get('/', (req, res) => {
    res.send(1)
  })
  .post('/repo', async (req, res) => {
    let config = {
      ...options,
      ...req.body
    }

    let tmpfolder = path.join('/tmp/', uuidv1())
    execSync(`git clone ${config.repository} ${tmpfolder}`);

    config.folder = path.join(tmpfolder, config.folder)

    let links = _404(config)
    links.on('end', (result) => {
      res.json(result)
      console.log('deleting folder: ', config.folder)
      fs.rmdirSync(config.folder, { recursive: true });
    })
  })
  .listen(8080, () => {
    console.log('started')
  })
