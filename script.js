(function () {
  'use strict';

  var startInput = document.getElementById('startInput');
  var endInput = document.getElementById('endInput');
  var startHalfCheck = document.getElementById('startHalfCheck');
  var endHalfCheck = document.getElementById('endHalfCheck');
  var excludeWeekendCheck = document.getElementById('excludeWeekendCheck');
  var holidaysInput = document.getElementById('holidaysInput');

  var daysOut = document.getElementById('daysOut');
  var totalDaysOut = document.getElementById('totalDaysOut');
  var weekendDaysOut = document.getElementById('weekendDaysOut');
  var holidayDaysOut = document.getElementById('holidayDaysOut');

  function parseYMD(str) {
    var parts = str.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }

  function ymdKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function parseHolidaySet(text) {
    var set = new Set();
    text.split('\n').forEach(function (line) {
      var t = line.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) set.add(t);
    });
    return set;
  }

  function calc() {
    if (!startInput.value || !endInput.value) {
      daysOut.textContent = '--';
      totalDaysOut.textContent = '';
      weekendDaysOut.textContent = '';
      holidayDaysOut.textContent = '';
      return;
    }

    var start = parseYMD(startInput.value);
    var end = parseYMD(endInput.value);

    if (end < start) {
      daysOut.textContent = '--';
      totalDaysOut.textContent = '结束日期早于开始日期，请检查';
      weekendDaysOut.textContent = '';
      holidayDaysOut.textContent = '';
      return;
    }

    var holidaySet = parseHolidaySet(holidaysInput.value);
    var excludeWeekend = excludeWeekendCheck.checked;

    var totalDays = 0, weekendDays = 0, holidayDays = 0, leaveDays = 0;
    var cursor = new Date(start);
    var startKey = ymdKey(start);
    var endKey = ymdKey(end);

    while (cursor <= end) {
      totalDays++;
      var dow = cursor.getDay();
      var isWeekend = dow === 0 || dow === 6;
      var isHoliday = holidaySet.has(ymdKey(cursor));
      if (isWeekend) weekendDays++;
      if (isHoliday) holidayDays++;

      var excluded = (excludeWeekend && isWeekend) || isHoliday;
      if (!excluded) {
        var dayValue = 1;
        var key = ymdKey(cursor);
        if (key === startKey && startHalfCheck.checked) dayValue = 0.5;
        if (key === endKey && endHalfCheck.checked) dayValue = (dayValue === 0.5 && startKey === endKey) ? 0.5 : dayValue - 0.5;
        leaveDays += dayValue;
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    daysOut.textContent = leaveDays + ' 天';
    totalDaysOut.textContent = totalDays + ' 天';
    weekendDaysOut.textContent = weekendDays + ' 天';
    holidayDaysOut.textContent = holidayDays + ' 天';
  }

  [startInput, endInput, startHalfCheck, endHalfCheck, excludeWeekendCheck, holidaysInput].forEach(function (el) {
    el.addEventListener('input', calc);
    el.addEventListener('change', calc);
  });

  var today = new Date();
  var in3days = new Date(today.getTime() + 3 * 86400000);
  startInput.value = ymdKey(today);
  endInput.value = ymdKey(in3days);
  calc();
})();
