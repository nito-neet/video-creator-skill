import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setCodec('h264');
Config.setChromiumOpenGlRenderer('angle');
Config.overrideWebpackConfig((config) => ({
  ...config,
  module: {
    ...config.module,
    rules: [
      ...(config.module?.rules ?? []),
      {test: /\.(woff2?)$/, type: 'asset/resource'},
    ],
  },
}));
