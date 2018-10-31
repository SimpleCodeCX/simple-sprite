let fs = require('fs');
let path = require('path');
let log4js = require('log4js');
var logger = log4js.getLogger('ngo-sprite');
var images = require('images');
logger.level = 'info';


/**
 * 保存图片的信息
 */
class ImageInfo {
  constructor(path, size) {
    this.path = path;
    this.width = size.width;
    this.height = size.height;
    this.area = this.width * this.height;
  }
}

/**
 * 坐标点
 */
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * 图片在雪碧图中的位置信息
 * params：
 *    x,y： 图片在雪碧图中的坐标
 *    width,height：图片的宽高
 *    path：图片的绝对路径
 * isCollided（Function）：检查本region是不是与region发生碰撞（重叠）
 */
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

// 目标文件夹
let targetImagesDirPath = process.argv[2];

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

/**
 * 图片按照从大到小进行排列
 */
imageInfos.sort((image1, image2) => image1.area < image2.area);

/**
 * 保存图片在雪碧图上的位置信息
 */
let regions = [];

/**
 * points用于保存雪碧图中的可用坐标点，初始化为（0,0）
 * 何为可用坐标点：“可用坐标点”有机会成为下一张新图片的绘制起点坐标（本算法默认从图片的“左上点”开始绘制）
 * 规则如下：寻找最佳可用点坐标，比如找到（0,0）为最佳可用点，那么将新图片绘画至雪碧图的（0,0）上,并且生成该图片在雪碧图上的位置信息region
 * 此时，从points中删除（0,0）,并且添加两个新的可用坐标定（region.right,region.top）、（region.left，region.bottom）
 * 注意：每张图片（即矩形）有四个顶点，在雪碧图上的坐标按照顺时针的方向分别是（region.left,region.top）、（region.right，region.top）、（region.right，region.bottom）、（region.left,region.bottom）
 */
let points = [];
let startPoint = new Point(0, 0);
points.push(startPoint);

/**
 * 从points中寻找所有符合要求的待绘入图片的region.
 * 何为符合要求？当不与所有当前已经在雪碧图中的图片发生碰撞（重叠），即符合要求
 */
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

/**
 * 从所有符合要求的region中，找出绘入后，雪碧图总面积最小的region
 */
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

/**
 * 计算雪碧图的总面积
 */
function getTotalAreaOfRegions(region) {
  let w = getTotalWidthOfRegions(region);
  let h = getTotalHeightOfRegions(region);
  return w * h;
}

/**
 * 计算雪碧图的总宽度
 */
function getTotalWidthOfRegions(region) {
  let _totalWidth = region ? region.right : 0;
  regions.forEach(item => {
    _totalWidth = Math.max(_totalWidth, item.right);
  });
  return _totalWidth;
}

/**
 * 计算雪碧图的总高度
 */
function getTotalHeightOfRegions(region) {
  let _totalHeight = region ? region.bottom : 0;
  regions.forEach(item => {
    _totalHeight = Math.max(_totalHeight, item.bottom);
  });
  return _totalHeight;
}

/**
 * 确定所有图片的region，生成regions
 */
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

/**
 * 根据regions进行绘画
 */
var sprintImage = images(getTotalWidthOfRegions(), getTotalHeightOfRegions());
regions.forEach(region => {
  sprintImage.draw(images(region.path), region.x, region.y);
});
sprintImage.save(path.join(targetImagesDirPath, 'sprite.png'));

/**
 * 生成css文件
 */
let content = '';
for (let i = 0, len = regions.length; i < len; i++) {
  let _imgCss = `{${regions[i].path},background-position: -${regions[i].x}px -${regions[i].y}px,width:${regions[i].width}px,height:${regions[i].height}px}\n`;
  content = content + _imgCss;
}
fs.writeFileSync(path.join(targetImagesDirPath, './sprite-css.txt'), content);
logger.info(`generate sprite image success,it has been saved in ${targetImagesDirPath}/sprite.png`);
logger.info(`generate css success,it has been saved in ${targetImagesDirPath}/sprite-css.txt`);





