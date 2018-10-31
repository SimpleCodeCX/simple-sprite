

// import fs from 'fs';
// import path from 'path';
// import log4js from 'log4js';
// import images from 'images';




export class ImageInfo {
  constructor(path, size) {
    this.path = path;
    this.width = size.width;
    this.height = size.height;
    this.area = this.width * this.height;
  }
}

export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Region {
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


export class SimpleSprite {
  constructor() {
    this.points = [];
    this.regions = [];
    this.initPoints();
  }
  initPoints() {
    let startPoint = new Point(0, 0);
    this.points.push(startPoint);
  }
  getPossibleRegions(width, height, path) {
    let regionList = [];

    this.points.forEach(point => {
      let region_new = new Region(point.x, point.y, width, height, path);
      let len = this.regions.length;
      if (len === 0) {
        regionList.push(region_new);
      } else {
        let isAllNotCollided = true;
        for (let i = 0; i < len; i++) {
          if (this.regions[i].isCollided(region_new)) {
            isAllNotCollided = false;
          }
        }
        isAllNotCollided ? regionList.push(region_new) : null;
      }

    });
    return regionList;
  }
  getSmallestAreaRegion(width, height, path) {
    let regionList = this.getPossibleRegions(width, height, path);

    let minarea = Number.MAX_VALUE;
    let minRegion;
    regionList.forEach(item => {
      let area = this.getTotalAreaOfRegions(item);
      if (minarea > area) {
        minarea = area;
        minRegion = item;
      }
    });
    return minRegion;
  }
  getTotalAreaOfRegions(region) {
    let w = this.getTotalWidthOfRegions(region);
    let h = this.getTotalHeightOfRegions(region);
    return w * h;
  }
  getTotalWidthOfRegions(region) {
    let _totalWidth = region ? region.right : 0;
    this.regions.forEach(item => {
      _totalWidth = Math.max(_totalWidth, item.right);
    });
    return _totalWidth;
  }
  getTotalHeightOfRegions(region) {
    let _totalHeight = region ? region.bottom : 0;
    this.regions.forEach(item => {
      _totalHeight = Math.max(_totalHeight, item.bottom);
    });
    return _totalHeight;
  }
}













