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
 * @param {boolean} (optional) options.httpsOnly - Enforce https links
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
      this._mapping = {}

      // find the content of the options folder
      const fileList = glob.sync(`${options.folder}/**/*.+(md|mdx)`)
      let list = fileList
        .filter((filename) => {
          return false === options.ignore.files.includes(filename)
        })
        .reduce((all, file) => {
          const fileContent = fs.readFileSync(file, 'utf-8').split('\n')
          const lines = fileContent.map((line, index) => {
            let match = line.match(URL_REGEXP)
            match = (match || []).map(url => url.replace('(', '').replace(')', ''))
            return match.map(url => {
              if (url.includes(')') && !url.includes('(')) {
                url = url.replace(')', '')
              }
              const item = {
                file: file.replace(this.options.folder + path.sep, ''),
                line: index + 1
              }
              try {
                item.url = new URL(url)
              } catch (e) {
                item.url = url
                item.status = e.code
              }
              return item
            })
          })
          .flat()
          return all.concat(lines)
        }, [])
        .flat()

      this.urls = list;

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

    format(item, status) {
      const url = item.url.href || item.url
      let passed = false
      if (status === 'IGNORED' || String(status)[0] === '2') {
        passed = true
      }

      return {
        ...item,
        url,
        status,
        passed
      }
    }

    alreadyChecked(url) {
      return this.result.some(item => {
        return item.url === url.href
      })
    }

    async *fetchStatus (urls, ignoreUrls = []){
      for (let item of urls) {
        if (true === this.alreadyChecked(item.url)) {
          continue
        }
        if (item.status) {
          yield this.format(item, item.status)
        } else if (this.shouldWeIgnore(item, ignoreUrls)) {
          yield this.format(item, 'IGNORED')
        } else if (this.options.httpsOnly === true && item.url.protocol === 'http:' ) {
          yield this.format(item, 'SHOULD_BE_HTTPS')
        } else {
          const options = {
            throwHttpErrors: false,
            timeout: 5000
          }
          try {
            const delay = this.options.delay[item.url.origin]
            if (delay) {
              await this.timeout(delay)
            }
            const { statusCode } = await got(item.url, options)
            yield this.format(item, statusCode)
          } catch (e) {
            yield this.format(item, e.code)
          }
        }
      }
    }
    
    shouldWeIgnore(item, list) {
      const url = item.url
      const result = list.some(ignore => {
        ignore = new URL(ignore)
        const match = ignore.href.split('*')
        if (match.length === 1) {
          return ignore.href === url.href
        } else if(match.length === 2) {
          return url.href.startsWith(match[0]) || match[0] === url.href
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
