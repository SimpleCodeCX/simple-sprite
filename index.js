let fs = require('fs');
let path = require('path');
let log4js = require('log4js');
var images = require('images');

var logger = log4js.getLogger('index.js');
logger.level = 'info';

class ImageInfo {
  constructor(path, size) {
    this.path = path;
    this.width = size.width;
    this.height = size.height;
    this.area = this.width * this.height;
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Region {
  constructor(x, y, width, height, path) {
    this.path = path;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
    this.centerX = (this.left + this.right) / 2;
    this.centerY = (this.top + this.bottom) / 2;
  }
  isCollided(region) {
    var collided = (Math.abs(this.centerX - region.centerX) < (this.width + region.width) / 2)
      && (Math.abs(this.centerY - region.centerY) < (this.height + region.height) / 2);
    return collided;
  }
}

let targetImagesDirPath = process.argv[2];

if (!targetImagesDirPath) {
  logger.error('please input image dir.');
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

let regions = [];

let points = [];
let startPoint = new Point(0, 0);
points.push(startPoint);

function getPossibleRegions(width, height, path) {
  let regionList = [];
  points.forEach(point => {
    let region_new = new Region(point.x, point.y, width, height, path);
    let len = regions.length;
    if (len === 0) {
      regionList.push(region_new);
    } else {
      let isAllNotCollided = true;
      for (let i = 0; i < len; i++) {
        if (regions[i].isCollided(region_new)) {
          isAllNotCollided = false;
        }
      }
      isAllNotCollided ? regionList.push(region_new) : null;
    }

  });
  return regionList;
}

function getSmallestAreaRegion(width, height, path) {
  let regionList = getPossibleRegions(width, height, path);
  let minarea = Number.MAX_VALUE;
  let minRegion;
  regionList.forEach(item => {
    let area = getTotalAreaOfRegions(item);
    if (minarea > area) {
      minarea = area;
      minRegion = item;
    }
  });
  return minRegion;
}

function getTotalAreaOfRegions(region) {
  let w = getTotalWidthOfRegions(region);
  let h = getTotalHeightOfRegions(region);
  return w * h;
}

function getTotalWidthOfRegions(region) {
  let _totalWidth = region ? region.right : 0;
  regions.forEach(item => {
    _totalWidth = Math.max(_totalWidth, item.right);
  });
  return _totalWidth;
}

function getTotalHeightOfRegions(region) {
  let _totalHeight = region ? region.bottom : 0;
  regions.forEach(item => {
    _totalHeight = Math.max(_totalHeight, item.bottom);
  });
  return _totalHeight;
}

imageInfos.forEach((item, index) => {
  let region = getSmallestAreaRegion(item.width, item.height, item.path);
  if (region) {
    regions.push(region);
    points.push(new Point(region.right, region.top));
    points.push(new Point(region.left, region.bottom));
    let index = points.findIndex(point => {
      return point.x === region.x && point.y === region.y;
    });
    points.splice(index, 1);
  }
});

var sprintImage = images(getTotalWidthOfRegions(), getTotalHeightOfRegions());
regions.forEach(region => {
  // logger.info(region);
  sprintImage.draw(images(region.path), region.x, region.y);
});
sprintImage.save(path.join(targetImagesDirPath, 'sprite.png'));


// 生成css文件
let content = '';
for (let i = 0, len = regions.length; i < len; i++) {
  let _imgCss = `{${regions[i].path},background-position: -${regions[i].x}px -${regions[i].y}px,width:${regions[i].width}px,height:${regions[i].height}px}\n`;
  content = content + _imgCss;
}
fs.writeFileSync(path.join(targetImagesDirPath, './sprite-css.txt'), content);





