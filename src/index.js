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
    //find the content of the options folder
    const filesContent = glob.sync(`${options.folder}/**/*.md`)
    let results = [];
    filesContent.forEach(item => {
        //find the list of url write in  files 
        const str = fs.readFileSync(item, 'utf-8')
            //verify if the content of the file start by http or https
        let result = str.match(/\(((https|http){1}.*?)\)/gm)
            //delete the duplicates url
        result = [...new Set(result)];
        results = results.concat(result);
    })
    var promiseList = results.map((item) => {
            // delete the brackets of each elements in the array
            item = item.replace('(', '').replace(')', '')
            return got(item);

        })
        //verify the status of the promises and add value in the object
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
                        filesContent.push(item.value.statusCode)
                    } else if (item.status === 'rejected') {
                        obj.status = item.reason.response.statusCode;
                        obj.passed = false
                        obj.url = item.reason.response.url;
                        filesContent.push(item.reason.response.statusCode)
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