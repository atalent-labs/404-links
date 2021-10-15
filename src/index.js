const fs = require('fs');
const glob = require("glob");
const got = require('got');
const path = require('path');

/**
 * Instanciate 404-links
 *
 * @param {Object} options
 * @param {Stream.Writable} options.stream - 
 * @param {string} (optional) options.folder - Define the folder where the markdown files are located
 * @param {array<string>} (optional) options.ignore.urls - Ignore a list of urls
 * @param {array<string>} (optional) options.ignore.files - List of file that we do not want to parse
 * @return {object}
 *
 * @example
 *
 * const NotFoundLinks = require('404-links')
 * const { Writable } = require('stream')
 *
 * const options = {
 *   stream: new Writable({ write: (chunk, _, done) => console.log(chunk)})
 *   folder: './docs',
 *   ignore: {
 *     urls: [
 *     ],
 *     files: [
 *     ]
 *   }
 * }
 *
 * const notFound = NotFoundLinks(options)
 */
module.exports = function(options) {
    if (options && fs.existsSync(options.folder) == false) {
      throw new Error(`The folder "${options.folder}" doesn't exist, please share an existing folder.`)
    }

    if (!options['stream']) {
      throw new Error('The options stream is not defined, please pass a valid Writable stream.')
    }

    options.ignore = options.ignore || {}
    options.ignore.urls = options.ignore.urls || []
    options.ignore.files = options.ignore.files || []
    options.ignore.files = options.ignore.files.map(file => {
      return path.resolve(options.folder, file)
    })

    // find the content of the options folder
    const fileList = glob.sync(`${options.folder}/**/*.+(md|mdx)`)
    let urls = fileList
      .filter((filename) => {
        return false === options.ignore.files.includes(filename)
      })
      .reduce((all, item) => {
        const fileContent = fs.readFileSync(item, 'utf-8')
        let match = fileContent
          .match(/\(((https|http){1}.*?)\)/gm)
          .map(url => url.replace('(', '').replace(')', ''))
        return all.concat(match)
      }, [])
    urls = [...new Set(urls)];

    (async function () {
      try {
        const result = fetchStatus(urls, options.ignore.urls);
        for await (const item of result) {
          options.stream.write(Buffer.from(JSON.stringify(item)))
        }
      } catch(e) {
        console.log(e)
      }
      options.stream.end()
    })()
}

async function* fetchStatus (urls, ignoreUrls = []){
  for (let _url of urls) {
    if (shouldWeIgnore(_url, ignoreUrls)) {
      yield {
        url: _url,
        status: 'ignored',
        passed: true
      }
    } else {
      const options = {
        throwHttpErrors: false
      }
      const { statusCode, url } = await got(_url, options)
      yield {
        url,
        status: statusCode,
        passed: String(statusCode)[0] === '2'
      }
    }
  }
}

function shouldWeIgnore(url, list) {
  const result = list.some(ignore => {
    const match = ignore.split('/*')
    if (match.length === 1) {
      return match[0] === url
    } else if(match.length === 2) {
      return url.startsWith(match[0]) || match[0] === url
    } else {
      return false
    }
  })
  return result
}
