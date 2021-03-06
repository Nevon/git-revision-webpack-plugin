var path = require('path')
var exec = require('child_process').exec
var removeEmptyLines = require('./helpers/remove-empty-lines.js')

module.exports = function buildFile (compiler, gitWorkTree, command, replacePattern, asset) {
  var data = ''

  compiler.plugin('compilation', function (compilation) {
    var gitCommand = gitWorkTree
      ? [
        'git',
        '--git-dir=' + path.join(gitWorkTree, '.git'),
        '--work-tree=' + gitWorkTree,
        command
      ].join(' ')
      : [
        'git',
        command
      ].join(' ')

    compilation.plugin('optimize-tree', function (chunks, modules, callback) {
      exec(gitCommand, function (err, stdout) {
        if (err) { return callback(err) }
        data = removeEmptyLines(stdout)

        callback()
      })
    })

    compilation.mainTemplate.plugin('asset-path', function (path) {
      return path.replace(replacePattern, data)
    })
  })

  compiler.plugin('emit', function (compilation, callback) {
    compilation.assets[asset] = {
      source: function () {
        return data
      },
      size: function () {
        return data.length
      }
    }

    callback()
  })
}
