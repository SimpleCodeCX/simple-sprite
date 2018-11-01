packaged simple-sprite
====================================
one tool to generator sprite image.

Github Project: [https://github.com/SimpleCodeCX/simple-sprite](https://github.com/SimpleCodeCX/simple-sprite)
### Install

```
npm install --save simple-sprite 
```
### Usage

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


