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
 * const notFound = new NotFoundLinks(options)
 * console.log(result)
 */
module.exports = function (options) {
    throw new Error(`The folder "${options.folder}" doesn't exist, please share an existing folder.`)
}
