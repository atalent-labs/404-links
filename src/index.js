const fs = require('fs');
const glob = require("glob");
const got = require('got');
/**
 * Instanciate 404-links
 *
 * @param {Object} options
 * @param {Stream.Writable} options.stream - 
 * @param {string} (optional) options.folder - Define the folder where to initiate restqa
 * @param {array<string>} (optional) options.ignore - Continuous integration tool that required to be setup
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
 *   ignore: [
 *   ]
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

    const arr = glob.sync(`${options.folder}/**/*.md`)
    arr.forEach(item => {
        const maString = fs.readFileSync(item, 'utf-8')
        const resultat = maString.match(/\(((https|http){1}.*?)\)/gm)
        resultat.forEach(item => {
            item = item.replace('(', '')
            item = item.replace(')', '')
            got(item).then((value) => {
                const obj = {
                    url: null,
                    status: null,
                    passed: null
                }
                obj.status = value.statusCode;
                obj.url = item;
                if (value.statusCode === 200) {
                    obj.passed = true
                } else {
                    obj.passed = false
                }
                options.stream.write(Buffer.from(JSON.stringify(obj)))
                options.stream.end()
            })
        })
    })

    //options.stream.write(Buffer.from(JSON.stringify({ foo: 'bar' })))
    //options.stream.end()
}