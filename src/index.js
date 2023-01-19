const fs = require('fs');
const glob = require("glob");
const got = require('got');
const path = require('path');
const { Readable } = require('stream');
const { URL } = require('url');

/**
 * Instanciate 404-links
 *
 * @param {Object} options
 * @param {string} (optional) options.folder - Define the folder where the markdown files are located
 * @param {array<string>} (optional) options.ignore.urls - Ignore a list of urls
 * @param {array<string>} (optional) options.ignore.files - List of file that we do not want to parse
 * @param {Object} (optional) options.delay - perform a delay on the matching host
 * @return {Readable}
 *
 * @example
 *
 * const NotFoundLinks = require('404-links')
 *
 * const options = {
 *   folder: './docs',
 *   ignore: {
 *     urls: [
 *     ],
 *     files: [
 *     ]
 *   },
 *   delay: {
 *     'https://github.com': 500
 *   }
 * }
 *
 * const ReadableStream = new NotFoundLinks(options)
 */

const URL_REGEXP = /\(((https|http){1}.*?)\)?\)/gm

class Stream404 extends Readable {

    constructor(options) {
      super();

      if (options && fs.existsSync(options.folder) == false) {
        throw new Error(`The folder "${options.folder}" doesn't exist, please share an existing folder.`)
      }

      options.ignore = options.ignore || {}
      options.ignore.urls = options.ignore.urls || []
      options.ignore.files = options.ignore.files || []
      options.ignore.files = options.ignore.files.map(file => {
        return path.resolve(options.folder, file)
      })
      options.delay = options.delay || {}

      this.options = options
      this._result = []

      // find the content of the options folder
      const fileList = glob.sync(`${options.folder}/**/*.+(md|mdx)`)
      let urls = fileList
        .filter((filename) => {
          return false === options.ignore.files.includes(filename)
        })
        .reduce((all, item) => {
          const fileContent = fs.readFileSync(item, 'utf-8')
          let match = fileContent.match(URL_REGEXP)
          match = (match || []).map(url => url.replace('(', '').replace(')', ''))
          return all.concat(match)
        }, [])

      this.urls = [...new Set(urls)];

      (async () => {
        try {
          const result = this.fetchStatus(this.urls, this.options.ignore.urls);
          for await (const item of result) {
            this._result.push(item)
            this.push(Buffer.from(JSON.stringify(item)))
          }
        } catch(e) {
          console.log(e)
        }
        this.push(null)
      })()
    }

    get result () {
      return this._result
    }

    get errors () {
      return this._result.filter(item => !item.passed)
    }

    _read () {
      null
    }

    async *fetchStatus (urls, ignoreUrls = []){
      for (let _url of urls) {
        if (this.shouldWeIgnore(_url, ignoreUrls)) {
          yield {
            url: _url,
            status: 'ignored',
            passed: true
          }
        } else {
          const options = {
            throwHttpErrors: false,
            timeout: 5000
          }
          try {
            _url = new URL(_url)
            const delay = this.options.delay[_url.origin]
            if (delay) {
              await this.timeout(delay)
            }
            const { statusCode, url } = await got(_url, options)
            yield {
              url,
              status: statusCode,
              passed: String(statusCode)[0] === '2'
            }
          } catch (e) {
            yield {
              url: _url,
              status: e.code,
              passed: false
            }
          }
        }
      }
    }
    
    shouldWeIgnore(url, list) {
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

    timeout(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
    }
}


module.exports = Stream404
