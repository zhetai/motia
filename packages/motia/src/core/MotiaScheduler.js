import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Time-Based Scheduling: MotiaScheduler
 * -------------------------------------
 * MotiaScheduler introduces time-based triggers into the Motia framework. It periodically emits
 * events based on defined schedules, enabling recurring or delayed actions.
 *
 * Key Responsibilities:
 * - Parse and manage time-based configurations (e.g., "1h", "30m")
 * - Set intervals or timers and emit corresponding events at defined intervals
 * - Integrate with workflows that depend on periodic checks or escalations
 *
 * This class allows workflows to incorporate scheduled behavior, such as escalating documents
 * if not approved within a certain time.
 */
export class MotiaScheduler {
  constructor() {
    this.schedules = new Map();
    this.activeJobs = new Map();
  }

  async findScheduleFiles(paths) {
    const fsPromises = fs.promises;
    const schedules = [];

    const searchSchedules = async (dir) => {
      let entries;
      try {
        entries = await fsPromises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          await searchSchedules(fullPath);
        } else if (
          entry.name.endsWith(".js") &&
          !entry.name.endsWith(".test.js")
        ) {
          schedules.push(fullPath);
        }
      }
    };

    for (const basePath of paths) {
      const schedulerPath = path.join(basePath, "scheduler");
      await searchSchedules(schedulerPath);
    }

    return schedules;
  }

  async initialize(core, schedulePaths = ["./src/workflows"]) {
    this.core = core;
    const scheduleFiles = await this.findScheduleFiles(
      schedulePaths.map((p) => path.resolve(p))
    );

    for (const file of scheduleFiles) {
      const scheduleModule = await import(pathToFileURL(file).href);
      if (scheduleModule.default) {
        const id = file.replace(/\.[jt]s$/, "");
        this.schedules.set(id, scheduleModule.default);
      }
    }
  }

  start() {
    this.schedules.forEach((schedule, id) => {
      const interval = this.parseSchedule(schedule.interval);

      const job = setInterval(() => {
        this.core.emit(
          {
            type: schedule.eventType,
            data: {
              scheduledAt: new Date().toISOString(),
              scheduleId: id,
            },
          },
          {
            metadata: {
              source: "scheduler",
              scheduleId: id,
            },
          }
        );
      }, interval);

      this.activeJobs.set(id, job);
    });
  }

  stop() {
    this.activeJobs.forEach((job) => {
      clearInterval(job);
    });
    this.activeJobs.clear();
  }

  parseSchedule(schedule) {
    const timeRegex = /^(\d+)(s|m|h|d)$/;
    const match = schedule.match(timeRegex);
    if (match) {
      const [, value, unit] = match;
      const num = parseInt(value, 10);
      switch (unit) {
        case "s":
          return num * 1000;
        case "m":
          return num * 60 * 1000;
        case "h":
          return num * 60 * 60 * 1000;
        case "d":
          return num * 24 * 60 * 60 * 1000;
        default:
          return 0;
      }
    }

    if (schedule.split(" ").length === 5) {
      // TODO: cron parsing
      return 60 * 60 * 1000;
    }

    throw new Error(`Invalid schedule format: ${schedule}`);
  }
}
