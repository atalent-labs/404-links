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
    let arr1 = [];
    arr.forEach(item => {
        const maString = fs.readFileSync(item, 'utf-8')
        let resultat = maString.match(/\(((https|http){1}.*?)\)/gm)
        resultat = [...new Set(resultat)];
        arr1 = arr1.concat(resultat);
    })
    var promiseList = arr1.map((item) => {
        item = item.replace('(', '')
        item = item.replace(')', '')
        return got(item);

    })

    Promise.allSettled(promiseList).then((results) => {
            try {
                results.forEach(item => {
                    const obj = {
                        url: null,
                        status: null,
                        passed: null
                    }

                    if (item.status === 'fulfilled') {
                        obj.status = item.value.statusCode;
                        obj.url = item.value.url;
                        obj.passed = true
                        arr.push(item.value.statusCode)
                    } else if (item.status === 'rejected') {
                        obj.status = item.reason.response.statusCode;
                        obj.passed = false
                        obj.url = item.reason.response.url;
                        arr.push(item.reason.response.statusCode)
                    }
                    options.stream.write(Buffer.from(JSON.stringify(obj)))
                })
            } catch (e) {
                console.log(e);
            }
            options.stream.end()
        })
        .catch((err) => {
            console.log(err);
        })


}