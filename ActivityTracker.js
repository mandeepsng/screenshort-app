const activeWin = require('active-win');
const _ = require('lodash');
const fs = require('fs-extra');

class ActivityTracker {
  constructor(filePath, interval) {
    this.filePath = filePath;
    this.interval = interval;
    this.start = null;
    this.app = null;
  }

  async getChartData() {
    const data = await fs.readJson(this.filePath);
    const formattedData = [];

    Object.entries(data).forEach(([key, val]) => {
      const programs = [];
      let totalTimeOnApp = 0;

      Object.entries(val).forEach(([prop, meta]) => {
        totalTimeOnApp += meta.time;
        programs.push({
          name: prop,
          url: meta.url,
          time: meta.time
        });
      });

      formattedData.push({
        title: key,
        total: Math.floor(totalTimeOnApp),
        data: programs,
        test: 90
      });
    });

    return formattedData;
  }

  async storeData() {
    if (!this.app) {
      console.error('No app data available to store.');
      return;
    }

    const content = await fs.readJson(this.filePath);
    const time = {
      start: this.start,
      end: new Date()
    };
    
    const { url, owner: { name }, title } = this.app;

    _.defaultsDeep(content, { [name]: { [title]: { time: 0, url } } });

    content[name][title].time += Math.abs(time.start - time.end) / 1000;

    await fs.writeJson(this.filePath, content, { spaces: 2 });
  }

  async init() {
    const fileExists = await fs.pathExists(this.filePath);

    if (!fileExists) {
      await fs.writeJson(this.filePath, {});
    }

    this.track();
  }

  async track() {
    setInterval(async () => {
      try {
        const window = await activeWin();

        if (!window) {
          console.error('Failed to retrieve active window information.');
          return;
        }

        if (!this.app) {
          this.start = new Date();
          this.app = window;
        }

        if (window.title !== this.app.title) {
          await this.storeData();
          this.app = window;  // Update app to the new window after storing data
          this.start = new Date();  // Reset start time for the new app
        }
      } catch (error) {
        console.error('Error tracking window activity:', error);
      }
    }, this.interval);
  }
}

module.exports = ActivityTracker;
