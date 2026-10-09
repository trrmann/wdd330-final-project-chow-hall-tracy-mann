import {
  Meal,
  Meals
} from './meals'

const weekAliasOffsets = {
  min: -3,
  last: -1,
  current: 0,
  next: 1,
  max: 3
};

const weekDays = [
  ['Mon', 'Monday'],
  ['Tue', 'Tuesday'],
  ['Wed', 'Wednesday'],
  ['Thu', 'Thursday'],
  ['Fri', 'Friday'],
  ['Sat', 'Saturday'],
  ['Sun', 'Sunday']
];

function toMondayDate(date = new Date()) {
  const monday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const distanceFromMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - distanceFromMonday);
  return monday.toISOString().slice(0, 10);
}

function addWeeks(date, offset) {
  const [year, month, day] = date.split('-').map(Number);
  const monday = new Date(Date.UTC(year, month - 1, day));
  monday.setUTCDate(monday.getUTCDate() + offset * 7);
  return monday.toISOString().slice(0, 10);
}

function parseDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) {
    throw new TypeError('weekStartDate must be a valid date in YYYY-MM-DD format');
  }
  return parsed;
}

function getWeekOffset(weekStartDate, referenceDate = toMondayDate()) {
  return Math.round((Date.parse(`${weekStartDate}T00:00:00.000Z`) -
    Date.parse(`${referenceDate}T00:00:00.000Z`)) / 604800000);
}

function getWeekName(weekStartDate) {
  const offset = getWeekOffset(weekStartDate);
  const namedOffset = Object.entries(weekAliasOffsets).find(([, value]) => value === offset);
  if (namedOffset) {
    return namedOffset[0];
  }
  return offset < 0 ? `week ${offset}` : `week +${offset}`;
}

function createDefaultMeals() {
  const meals = new Meals();
  [
    ['breakfast', 'Breakfast'],
    ['brunch', 'Brunch'],
    ['lunch', 'Lunch'],
    ['dinner', 'Dinner'],
    ['midnightMeal', 'Midnight Meal']
  ].forEach(([id, name]) => {
    meals.addMeal(new Meal({
      id,
      name
    }));
  });
  return meals;
};

function ensureWeekDays(days) {
  weekDays.forEach(([id, name]) => {
    if (!days.getDayByID(id) && !days.getDayByName(name)) {
      days.addDay(new Day({
        id,
        name
      }));
    }
  });
  return days;
}

export class Days {
  static fromJSON(json) {
    const instance = new Days();
    instance.#fromJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.keys(this.#collection).reduce((index, dayID) => {
      const name = this.#collection[dayID].Name;
      if (name) {
        index[name] = dayID;
      }
      return index;
    }, {});
  };
  #toJSON() {
    return {
      collection: this.#collection,
      index: this.#index
    };
  };
  #fromJSON(json) {
    if (json && json.collection) {
      this.#collection = Object.keys(json.collection).reduce((collection, key) => {
        collection[key] = Day.fromJSON(json.collection[key]);
        return collection;
      }, {});
      this.#rebuildIndex();
    }
  };
  constructor() {
    this.#collection = {};
    this.#index = {};
  };
  toJSON() {
    return this.#toJSON();
  };
  getDayByID(id) {
    return this.#collection[id];
  };
  getDayByName(name) {
    return this.#collection[this.#index[name]];
  };
  addDay(day) {
    if (!(day instanceof Day)) {
      throw new TypeError('day must be a Day instance');
    }
    if (day.ID === undefined || day.ID === null || String(day.ID).trim() === '') {
      throw new TypeError('day must have an ID');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, day.ID)) {
      throw new Error(`A day with ID "${day.ID}" already exists`);
    }
    this.#collection[day.ID] = day;
    this.#rebuildIndex();
    return day;
  };
  removeDayByID(id) {
    const day = this.#collection[id];
    if (day) {
      delete this.#collection[id];
      this.#rebuildIndex();
    }
    return day;
  };
  updateDay(day) {
    if (!(day instanceof Day)) {
      throw new TypeError('day must be a Day instance');
    }
    if (day.ID === undefined || day.ID === null || String(day.ID).trim() === '') {
      throw new TypeError('day must have an ID');
    }
    if (!Object.prototype.hasOwnProperty.call(this.#collection, day.ID)) {
      throw new Error(`No day exists with ID "${day.ID}"`);
    }
    this.#collection[day.ID] = day;
    this.#rebuildIndex();
    return day;
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
};

export class Day {
  static fromJSON(json) {
    const instance = new Day();
    instance.#fromJSON(json);
    return instance;
  };
  #ID;
  #Name;
  #Status;
  #meals;
  #toJSON() {
    return {
      id: this.#ID,
      name: this.#Name,
      status: this.#Status,
      meals: this.#meals.toJSON()
    };
  };
  #fromJSON(json) {
    if (json && json.id !== undefined && json.name !== undefined) {
      this.#ID = json.id;
      this.#Name = json.name;
      this.#Status = json.status ?? 'empty';
      this.#meals = json.meals instanceof Meals ?
        json.meals :
        json.meals === undefined ?
        createDefaultMeals() :
        Meals.fromJSON(json.meals);
    }
  };
  constructor({
    id = null,
    name = '',
    status = 'empty',
    meals = null
  } = {}) {
    this.#ID = id;
    this.#Name = name;
    this.#Status = status;
    this.#meals = meals === null ?
      createDefaultMeals() :
      meals instanceof Meals ?
      meals :
      Meals.fromJSON(meals);
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#ID;
  };
  get Name() {
    return this.#Name;
  };
  get status() {
    return this.#Status;
  };
  set status(status) {
    this.#Status = status;
  };
  get meals() {
    return this.#meals;
  };
  addMeal(meal) {
    return this.#meals.addMeal(meal);
  };
  removeMealByID(id) {
    return this.#meals.removeMealByID(id);
  };
  updateMeal(meal) {
    return this.#meals.updateMeal(meal);
  };
  clearMeals() {
    this.#meals.clearAll();
  };
};

export class Week {
  static fromJSON(json) {
    const instance = new Week();
    instance.#fromJSON(json);
    return instance;
  };
  #ID;
  #weekStartDate;
  #days;
  #toJSON() {
    return {
      id: this.#ID,
      weekStartDate: this.#weekStartDate,
      days: this.#days.toJSON()
    };
  };
  #fromJSON(json) {
    if (json && json.weekStartDate) {
      this.#weekStartDate = toMondayDate(parseDate(json.weekStartDate));
      this.#ID = this.#weekStartDate;
      this.#days = json.days instanceof Days ?
        json.days :
        Days.fromJSON(json.days || {});
      ensureWeekDays(this.#days);
    }
  };
  constructor({
    weekStartDate = toMondayDate(),
    days = new Days()
  } = {}) {
    if (typeof weekStartDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
      throw new TypeError('weekStartDate must be a valid date in YYYY-MM-DD format');
    }
    this.#weekStartDate = toMondayDate(parseDate(weekStartDate));
    this.#ID = this.#weekStartDate;
    this.#days = days instanceof Days ? days : Days.fromJSON(days);
    ensureWeekDays(this.#days);
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#ID;
  };
  get Name() {
    return getWeekName(this.#weekStartDate);
  };
  get weekStartDate() {
    return this.#weekStartDate;
  };
  get days() {
    return this.#days;
  };
  addDay(day) {
    return this.#days.addDay(day);
  };
  removeDayByID(id) {
    return this.#days.removeDayByID(id);
  };
  updateDay(day) {
    return this.#days.updateDay(day);
  };
  clearDays() {
    this.#days.clearAll();
  };
};

export class Weeks {
  static fromJSON(json) {
    const instance = new Weeks();
    instance.#fromJSON(json);
    return instance;
  };
  #collection;
  #index;
  #rebuildIndex() {
    this.#index = Object.keys(this.#collection).reduce((index, weekStartDate) => {
      const week = this.#collection[weekStartDate];
      index[weekStartDate] = weekStartDate;
      index[week.Name] = weekStartDate;
      return index;
    }, {});
  };
  #toJSON() {
    return {
      collection: this.#collection,
      index: this.#index
    };
  };
  #fromJSON(json) {
    if (json && json.collection) {
      this.#collection = Object.keys(json.collection).reduce((collection, key) => {
        const week = Week.fromJSON(json.collection[key]);
        collection[week.ID] = week;
        return collection;
      }, {});
      this.#rebuildIndex();
    }
  };
  constructor() {
    this.#collection = {};
    this.#index = {};
  };
  toJSON() {
    return this.#toJSON();
  };
  getWeekByID(weekStartDate) {
    return this.#collection[weekStartDate];
  };
  getWeekByName(name) {
    this.#rebuildIndex();
    return this.#collection[this.#index[String(name).toLocaleLowerCase()]];
  };
  getWeekByOffset(offset, referenceDate = toMondayDate()) {
    return this.getOrCreateWeek(addWeeks(referenceDate, offset));
  };
  getOrCreateWeek(weekStartDate) {
    const monday = toMondayDate(parseDate(weekStartDate));
    if (!this.#collection[monday]) {
      this.addWeek(new Week({
        weekStartDate: monday
      }));
    }
    return this.#collection[monday];
  };
  addWeek(week) {
    if (!(week instanceof Week)) {
      throw new TypeError('week must be a Week instance');
    }
    if (Object.prototype.hasOwnProperty.call(this.#collection, week.ID)) {
      throw new Error(`A week starting on "${week.ID}" already exists`);
    }
    this.#collection[week.ID] = week;
    this.#rebuildIndex();
    return week;
  };
  removeWeekByID(weekStartDate) {
    const week = this.#collection[weekStartDate];
    if (week) {
      delete this.#collection[weekStartDate];
      this.#rebuildIndex();
    }
    return week;
  };
  clearAll() {
    this.#collection = {};
    this.#index = {};
  };
  static getMondayDate(date = new Date()) {
    return toMondayDate(date);
  };
};
