'use strict';
// ─── mockDwhClient.js — fallback когда .env не заполнен ──────────────────────
//
// Предоставляет тот же интерфейс, что и realDwhClient.
// Метод query() бросает DB_UNAVAILABLE — роутеры перехватывают это и отдают
// данные из mock.js вместо DWH.
// buddy_requests, buddy_matches, buddy_events хранятся в server/data/*.json
// и не зависят от этого клиента.

const GIRLS_CITIES = ['Алматы', 'Астана', 'Караганда'];

const GIRLS_CLUBS = [
  { key: 'Crystal',   label: 'Crystal',   city: 'Алматы',    cityLabel: 'Almaty' },
  { key: 'Tole bi',   label: 'Tole bi',   city: 'Астана',    cityLabel: 'Astana' },
  { key: 'Orynbor',   label: 'Orynbor',   city: 'Астана',    cityLabel: 'Astana' },
  { key: 'Kunaeva',   label: 'Kunaeva',   city: 'Астана',    cityLabel: 'Astana' },
  { key: 'Sfera',     label: 'Sfera',     city: 'Астана',    cityLabel: 'Astana' },
  { key: 'Karaganda', label: 'Karaganda', city: 'Караганда', cityLabel: 'Karaganda' },
];

const GIRLS_PROGRAMS = [
  { key: 'barre',         name: 'Barre',                description: 'Грация балета + сила пилатеса. Тонус без ударной нагрузки.',                       level: 'Средний',   tags: ['#barre','#grace'],      matchProgram: 'Barre' },
  { key: 'glute-lab',     name: 'INVICTUS GLUTE LAB',   description: 'Работа на ягодицы и бёдра с весом и без — результат виден быстро.',                level: 'Средний',   tags: ['#glutes','#strength'],  matchProgram: 'Glute Lab' },
  { key: 'bootcamp',      name: 'INVICTUS BOOTCAMP',    description: 'Интенсивная кардио-силовая тренировка. Сжигаем, тонизируем, работаем.',            level: 'Средний',   tags: ['#cardio','#fullbody'],  matchProgram: 'BootCamp' },
  { key: 'stretching',    name: 'Stretching',           description: 'Растяжка, гибкость и расслабление. Мягкий старт или финал дня.',                  level: 'Новичок',   tags: ['#flex','#relax'],       matchProgram: 'Stretching' },
  { key: 'pilates',       name: 'Pilates mat',          description: 'Контроль тела, кор, осанка. Тонус без перегрузки суставов.',                      level: 'Новичок',   tags: ['#core','#posture'],     matchProgram: 'Pilates' },
  { key: 'yoga',          name: 'Yoga',                 description: 'Баланс тела и ума, дыхание, гибкость. Отличный способ начать.',                   level: 'Новичок',   tags: ['#mindful','#balance'],  matchProgram: 'Yoga' },
  { key: 'brazilian-butt',name: 'Brazillian Butt',      description: 'Поднимаем и округляем ягодицы — программа с фокусом на форму.',                   level: 'Средний',   tags: ['#booty','#shape'],      matchProgram: 'Glute Lab' },
  { key: 'bodysculpt',    name: 'BodySculpt',           description: 'Скульптурирование: рельеф и тонус без изматывающего кардио.',                    level: 'Средний',   tags: ['#sculpt','#tone'],      matchProgram: 'Barre' },
  { key: 'strong',        name: 'INVICTUS STRONG',      description: 'Силовая функциональная тренировка для уверенных и мотивированных.',               level: 'Уверенный', tags: ['#strength','#power'],   matchProgram: 'BootCamp' },
  { key: 'unknown',       name: 'Не знаю, подберите мне', description: 'Не уверена? Система подберёт программу под твою цель.',                        level: '',          tags: [],                       matchProgram: 'Не знаю, подберите мне' },
];

class MockDwhClient {
  constructor() {
    this.mode = 'mock';
  }

  async connect() {
    return { db: null, usr: null, pg_version: null, ts: new Date().toISOString() };
  }

  async query(_sql, _params) {
    const err = new Error('DWH unavailable (mock mode)');
    err.code  = 'DB_UNAVAILABLE';
    throw err;
  }

  async getInfo() {
    return { db: null, usr: null, pg_version: null, ts: new Date().toISOString() };
  }

  async getGirlsCities() {
    return GIRLS_CITIES;
  }

  async getGirlsClubs(city) {
    if (city) return GIRLS_CLUBS.filter(c => c.city === city);
    return GIRLS_CLUBS;
  }

  async getGirlsGroupPrograms(clubId) {
    // In mock mode, all programs available at every club
    return GIRLS_PROGRAMS;
  }

  async getClubStats() {
    const mock = require('../mock');
    return mock.clubStats || [];
  }

  async getGroupProgramStats() {
    const mock = require('../mock');
    return mock.programStats || [];
  }

  async getRetentionStats() {
    const mock = require('../mock');
    return mock.retentionStats || [];
  }

  async getCapacityStats() {
    const mock = require('../mock');
    return mock.capacityStats || [];
  }

  async getBuddyAnalytics() {
    const mock = require('../mock');
    return mock.buddyAnalytics || {};
  }

  async close() {}
}

module.exports = MockDwhClient;
