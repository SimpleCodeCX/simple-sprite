simple-sprite
====================================
one tool to generator sprite image 
### Usage 1

> 1、下载本源码到本地

> 2、下载相关依赖包
```
npm install 
```

### 运行代码生成雪碧图
```javascript
node ./index.js ./imgs
```

### 注释版代码
为了方便大家理解，我做了一份注释版的代码，放在index.annotation.js中

### Usage 2
为了方便使用，我把代码使用rollup进行打包，并且将其配置成npm包，大家也可以直接下载我的npm包进行雪碧图合成。
我的npm包如下：
simple-sprite: [https://www.npmjs.com/package/simple-sprite](https://www.npmjs.com/package/simple-sprite)



```javascript
// 支持es格式
import { generateSprite } from 'simple-sprite';
// ./imgs 图片目录
generateSprite('./imgs');
```
或

```javascript
// 支持umd或cjs格式
let sprite = require('simple-sprite');
sprite.generateSprite('./imgs'); 
```