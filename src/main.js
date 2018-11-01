
let fs = require('fs');
let path = require('path');
var images = require('images');
let log4js = require('log4js');
import { ImageInfo, Point, SimpleSprite } from './sprite';

var logger = log4js.getLogger('ngo-sprite');
logger.level = 'info';

export function generateSprite(targetImagesDirPath) {

  if (!targetImagesDirPath) {
    logger.error('please input image dir.');
    return;
  }
  let imageInfos = fs.readdirSync(targetImagesDirPath)
    .filter(filename => filename != 'sprite.png')
    .filter(filename => {
      let suffix = filename.substring(filename.indexOf('.')).toLowerCase();
      if (suffix != ".bmp" && suffix != ".png" && suffix != ".gif" && suffix != ".jpg" && suffix != ".jpeg") {
        return false;
      }
      return true;
    })
    .map(filename => path.join(targetImagesDirPath, filename))
    .filter(filepath => fs.statSync(filepath).isFile())
    .map(filepath => new ImageInfo(filepath, images(filepath).size()));

  imageInfos.sort((image1, image2) => image1.area < image2.area);

  let simpleSprite = new SimpleSprite();

  imageInfos.forEach((item, index) => {
    let region = simpleSprite.getSmallestAreaRegion(item.width, item.height, item.path);

    if (region) {
      simpleSprite.regions.push(region);
      simpleSprite.points.push(new Point(region.right, region.top));
      simpleSprite.points.push(new Point(region.left, region.bottom));
      let index = simpleSprite.points.findIndex(point => {
        return point.x === region.x && point.y === region.y;
      });
      simpleSprite.points.splice(index, 1);
    }
  });

  var sprintImage = images(simpleSprite.getTotalWidthOfRegions(), simpleSprite.getTotalHeightOfRegions());
  simpleSprite.regions.forEach(region => {
    sprintImage.draw(images(region.path), region.x, region.y);
  });

  sprintImage.save(path.join(targetImagesDirPath, 'sprite.png'));
  // 生成css文件
  let content = '';
  simpleSprite.regions.forEach((item) => {
    let _imgCss = `{${item.path},background-position: -${item.x}px -${item.y}px,width:${item.width}px,height:${item.height}px}\n`;
    content = content + _imgCss;
  });

  fs.writeFileSync(path.join(targetImagesDirPath, './sprite-css.txt'), content);
  logger.info(`generate sprite image success,it has been saved in ${targetImagesDirPath}/sprite.png`);
  logger.info(`generate css success,it has been saved in ${targetImagesDirPath}/sprite-css.txt`);
}
