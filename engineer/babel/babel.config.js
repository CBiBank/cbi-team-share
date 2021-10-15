module.exports = function (api) {
  const target = process.env.APP_TARGET
  api.cache(true)
  let plugins = []
  let presets = []
  switch (target) {
    case 'polyfill':
      plugins = []
      presets = [
        ['@babel/preset-env']
      ]
      break
    case 'corejs':
      plugins = []
      presets = [
        ['@babel/preset-env', {
          // false entry usage
          useBuiltIns: 'usage',
          corejs: 2
        }]
      ]
      break
    case 'runtime':
      plugins = [
        ['@babel/plugin-transform-runtime']
      ]
      presets = [
        ['@babel/preset-env']
      ]
      break
    case 'runtime-corejs2':
      plugins = [
        ['@babel/plugin-transform-runtime', {
          corejs: 2
        }]
      ]
      presets = [
        ['@babel/preset-env']
      ]
      break
    case 'runtime-corejs3':
      plugins = [
        ['@babel/plugin-transform-runtime', {
          corejs: 3
        }]
      ]
      presets = [
        ['@babel/preset-env']
      ]
      break
    default:
      plugins = [
        ['@babel/plugin-transform-arrow-functions']
      ]
  }
  return {
    plugins,
    presets
  }
}