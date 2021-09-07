import { Plugin } from 'esbuild';

export const uploadedPlugin = (fileMap: Record<string, string>): Plugin => {
  const originalFiles = Object.keys(fileMap);
  const regex = new RegExp(originalFiles.join('|'));

  return {
    name: 'uploaded',
    setup(build) {
      build.onResolve({ filter: regex }, args => {
        return {
          path: args.path,
          namespace: 'uploaded-ns',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'uploaded-ns' }, args => {
        return {
          contents: fileMap[args.path],
          loader: 'text',
        };
      });
    },
  };
};
