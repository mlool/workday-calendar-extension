const { override } = require("customize-cra")
const path = require("path")
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { WebpackManifestPlugin } = require("webpack-manifest-plugin")

// Custom overrides for entry
const overrideEntry = (config) => {
  config.entry = {
    background: "./src/background",
    content: "./src/content",
  }
  return config
}

// Custom overrides for output
const overrideOutput = (config) => {
  config.output = {
    ...config.output,
    filename: "static/js/[name].js",
    chunkFilename: "static/js/[name].js",
    path: path.resolve(__dirname, "build"),
  }
  return config
}

// Add or modify MiniCssExtractPlugin
const addOrUpdateMiniCssExtractPlugin = (config) => {
  const cssPlugin = new MiniCssExtractPlugin({
    filename: "static/css/[name].css",
    chunkFilename: "static/css/[name].chunk.css",
  })

  // Ensure plugins array is initialized
  config.plugins = config.plugins || []

  // Remove existing MiniCssExtractPlugin instances to avoid duplicates
  config.plugins = config.plugins.filter(
    (plugin) => !(plugin instanceof MiniCssExtractPlugin)
  )

  // Add the new instance of MiniCssExtractPlugin
  config.plugins.push(cssPlugin)

  return config
}

// Update WebpackManifestPlugin configuration
const updateManifestPlugin = (config) => {
  config.plugins = config.plugins.map((plugin) => {
    if (plugin.constructor.name === "WebpackManifestPlugin") {
      return new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: config.output.publicPath,
        generate: (seed, files, entrypoints) => {
          const manifestFiles = files.reduce((manifest, file) => {
            manifest[file.name] = file.path
            return manifest
          }, seed)

          const entrypointFiles = {}
          Object.keys(entrypoints).forEach((entrypoint) => {
            entrypointFiles[entrypoint] = entrypoints[entrypoint].filter(
              (fileName) => !fileName.endsWith(".map")
            )
          })

          return {
            files: manifestFiles,
            entrypoints: entrypointFiles,
          }
        },
      })
    }
    return plugin
  })

  return config
}

// Main export using customize-cra override
module.exports = override(
  overrideEntry,
  overrideOutput,
  addOrUpdateMiniCssExtractPlugin,
  updateManifestPlugin
)
