import {
  Meal,
  Meals
} from './meals'
import {
  addWeeks,
  createDefaultMeals,
  ensureWeekDays,
  getWeekName,
  parseDate,
  toMondayDate
} from '../utils.js'

export class Days {
  static #configuration;
  static configure(configuration) {
    Days.#configuration = configuration;
  };
  static get configuration() {
    if (!Days.#configuration) {
      throw new Error('Week configuration must be provided before creating week data');
    }
    return Days.#configuration;
  };
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
        createDefaultMeals(Meal, Meals, Days.configuration.mealTypes) :
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
      createDefaultMeals(Meal, Meals, Days.configuration.mealTypes) :
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
      ensureWeekDays(this.#days, Day, Days.configuration.weekDays);
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
    ensureWeekDays(this.#days, Day, Days.configuration.weekDays);
  };
  toJSON() {
    return this.#toJSON();
  };
  get ID() {
    return this.#ID;
  };
  get Name() {
    return getWeekName(this.#weekStartDate, Days.configuration.weekAliasOffsets);
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
  static configure(configuration) {
    Days.configure(configuration);
  };
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
