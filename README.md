# wait-external-webpack-plugin
## Description
通过对 entry 文件进行处理，业务逻辑将等待所依赖的 externals 文件加载完成后再开始执行。避免 externals 文件未加载完成或加载失败时，直接执行业务逻辑导致异常。

## Install
npm i -D wait-external-webpack-plugin

## Usage
``` js
const WaitExternalPlugin = require('wait-external-webpack-plugin');

module.exports = {
    entry: {
        pageA: "./src/pageA.js",
        pageB: "./src/pageB.js"
    },
    externals: [
        {
            jquery: 'window jQuery',
        },
        {
            react : ['React', 'subtract']
        }
    ],
    plugins: [
        new WaitExternalPlugin({
            test: /\.js$/,  // 正则匹配需要处理的 entry，默认对所有 entry 进行处理
        }),
    ]
};
```
