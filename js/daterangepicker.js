function showDateRangePicker($input) {
    $input = $($input);
    const today = new Date();
    const $container = $($input.closest(".vin--datepicker__container"));
    $container.find(".vindatepicker--dropdown__wrapp").remove();
    const isSingleInput = $container.hasClass("vindaterangepicker--single__input");
    const isCustom = $container.hasClass("vindaterangepicker__custom");
    let selectedFrom = isSingleInput
        ? ($input.val().split(" - ")[0] || null)
        : $container.find(".vindaterange--from__date").val() || null;
    let selectedTo = isSingleInput
        ? ($input.val().split(" - ")[1] || null)
        : $container.find(".vindaterange--to__date").val() || null;
    let initialFromTime = null;
    let initialToTime = null;
    if (selectedFrom && selectedFrom.includes(" ")) {
        const parts = selectedFrom.split(" ");
        selectedFrom = parts[0];
        if (parts.length >= 3) {
            initialFromTime = `${parts[1]} ${parts[2]}`;
        }
    }
    if (selectedTo && selectedTo.includes(" ")) {
        const parts = selectedTo.split(" ");
        selectedTo = parts[0];
        if (parts.length >= 3) {
            initialToTime = `${parts[1]} ${parts[2]}`;
        }
    }
    let fromDate = selectedFrom ? new Date(selectedFrom) : null;
    let toDate = selectedTo ? new Date(selectedTo) : null;
    let state = {
        left: {
            year: fromDate ? fromDate.getFullYear() : (today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear()),
            month: fromDate ? fromDate.getMonth() : (today.getMonth() === 0 ? 11 : today.getMonth() - 1)
        },
        right: {
            year: today.getFullYear(),
            month: today.getMonth()
        }
    };
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function formatDateSafe(date) {
        if (!date) return "";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "";
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }
    function parseDate(str) {
        return str ? new Date(str) : null;
    }
    let selectedLeft = null;
    let selectedRight = null;
    function renderHeader(side) {
        if (!isCustom) {
            return `
            <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vin--textcenter">
            <button class="vindatepicker--headernav__prev" data-side="${side}">«</button>
            <span class="vin--textcenter vinflex--1">${months[state[side].month]} ${state[side].year}</span>
            <button class="vindatepicker--headernav__next" data-side="${side}" ${state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month >= today.getMonth()) ? 'disabled' : ''}>»</button>
            </div>`;
        } else {
            return `
            <div class="vindatepicker--dropdown__wrapp__headernav vinflex vinflex--spacebetween vinflex--alignitemscenter vin__range__header">
                <div class="vincustom__year__clmn vinflex vinflex--1 vin--textcenter">${months[state[side].month]} ${state[side].year}</div>
                <div class="vin__day__clmn vinflex vinflex--1 vinflex--justifyend vinflex--alignitemscenter">
                    ${side === 'Today' ? 'Today' : 'Today'} <button class="vin-day-up" data-side="${side}">▲</button><button class="vin-day-down" data-side="${side}">▼</button>
                </div>
            </div>`;
        }
    }
    function renderCalendar(year, month, selectedDate = null, minDate = null, maxDate = null, otherSelectedDate = null, calendarSide = "left", fromSide = "left", toSide = "right") {
        const today = new Date();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const prevMonthLastDay = new Date(year, month, 0);
        if (selectedDate && !(selectedDate instanceof Date)) selectedDate = new Date(selectedDate);
        if (otherSelectedDate && !(otherSelectedDate instanceof Date)) otherSelectedDate = new Date(otherSelectedDate);
        if (minDate && !(minDate instanceof Date)) minDate = new Date(minDate);
        if (maxDate && !(maxDate instanceof Date)) maxDate = new Date(maxDate);

        function isSameDate(d1, d2) {
            return d1 && d2 &&
                d1.getFullYear() === d2.getFullYear() &&
                d1.getMonth() === d2.getMonth() &&
                d1.getDate() === d2.getDate();
        }
        function formatDate(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        let html = '<table><tbody>';
        const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
        html += '<tr>' + daysOfWeek.map(d => `<th>${d}</th>`).join('') + '</tr><tr>';
        for (let i = 0; i < firstDay.getDay(); i++) {
            const dateNum = prevMonthLastDay.getDate() - firstDay.getDay() + 1 + i;
            const dateObj = new Date(year, month - 1, dateNum);
            html += `<td data-date="${formatDate(dateObj)}" class="vin--textcenter prev__month disabled">${dateNum}</td>`;
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateObj = new Date(year, month, d);
            let classes = ["vin--textcenter"];
            const startDateObj = selectedFrom ? new Date(selectedFrom) : null;
            const endDateObj = selectedTo ? new Date(selectedTo) : null;
            const isStart = startDateObj && calendarSide === fromCalendarSide && isSameDate(dateObj, startDateObj);
            const isEnd = endDateObj && calendarSide === toCalendarSide && isSameDate(dateObj, endDateObj);
            const isToday = isSameDate(dateObj, today);
            if (isStart) {
                classes.push("vin__start__date");
            } else if (isEnd) {
                classes.push("vin__end__date");
            } else {
                const isEqualFrom = startDateObj && calendarSide !== fromCalendarSide && isSameDate(dateObj, startDateObj);
                const isEqualTo = endDateObj && calendarSide !== toCalendarSide && isSameDate(dateObj, endDateObj);
                if (isEqualFrom || isEqualTo) {
                    classes.push("vin__equal__date");
                } else {
                    if (dateObj > today) classes.push("disabled");
                    if (calendarSide === "right" && minDate && dateObj < minDate) {
                        classes.push("vindatepicker--less__date", "disabled");
                    }
                    if (calendarSide === "left" && maxDate && dateObj > maxDate) {
                        classes.push("vindatepicker--greater__date", "disabled");
                    }
                    if (selectedFrom && selectedTo) {
                        const startTime = startDateObj.getTime();
                        const endTime = endDateObj.getTime();
                        const tdTime = dateObj.getTime();
                        if (tdTime > startTime && tdTime < endTime &&
                            (calendarSide === fromCalendarSide || calendarSide === toCalendarSide)) {
                            classes.push("vin__between__dates");
                        }
                    }
                }
            }
            if (isToday) classes.push("vindatepicker--current__date");
            html += `<td data-date="${formatDate(dateObj)}" class="${classes.join(" ")}">${d}</td>`;
            if ((d + firstDay.getDay()) % 7 === 0) html += '</tr><tr>';
        }
        const totalCells = firstDay.getDay() + lastDay.getDate();
        const nextMonthDays = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= nextMonthDays; d++) {
            const dateObj = new Date(year, month + 1, d);
            html += `<td data-date="${formatDate(dateObj)}" class="vin--textcenter next__month disabled">${d}</td>`;
        }
        html += '</tr></tbody></table>';
        return html;
    }
    const $popup = $("<div class='vindatepicker--dropdown__wrapp'></div>");
    $container.append($popup);
    let activeRange = null;
    let lastFromTime = "";
    let lastToTime = "";
    function getCalendarSide(date) {
        const d = new Date(date);
        if (d.getFullYear() === state.left.year && d.getMonth() === state.left.month) return "left";
        return "right";
    }
    const minYear = 1900;
    const maxYear = new Date().getFullYear();
    function render() {
        state.left.year = Math.min(Math.max(state.left.year, minYear), maxYear);
        state.right.year = Math.min(Math.max(state.right.year, minYear), maxYear);
        state.left.month = Math.min(Math.max(state.left.month, 0), 11);
        state.right.month = Math.min(Math.max(state.right.month, 0), 11);
        if (state.right.year > today.getFullYear()) {
            state.right.year = today.getFullYear();
            state.right.month = today.getMonth();
        } else if (state.right.year === today.getFullYear() && state.right.month > today.getMonth()) {
            state.right.month = today.getMonth();
        }
        const minDate = selectedFrom ? parseDate(selectedFrom) : null;
        const isCustom = $container.hasClass("vindaterangepicker__custom");
        let sidebarHTML = '';
        if (isCustom) {
            const ranges = ["all", "last3", "last2", "last1", "last10", "weekly", "today"];
            sidebarHTML = `
        <div class="vindaterangepicker--sidebar">
            <ul>
                ${ranges.map(r => `<li data-range="${r}" ${(activeRange === r || (!activeRange && r === "last1")) ? "class='active'" : ""}>${formatRangeLabel(r)}</li>`).join("")}
            </ul>
        </div>`;
        }
        let timeHTMLLeft = '', timeHTMLRight = '', buttonHTML = '';
        if (isCustom) {
            const now = new Date();
            let hour12 = now.getHours() % 12 || 12;
            let currentAMPM = now.getHours() >= 12 ? "PM" : "AM";
            let currentMinute = now.getMinutes();
            let leftHour = hour12, leftMinute = currentMinute, leftAMPM = currentAMPM;
            let rightHour = hour12, rightMinute = currentMinute, rightAMPM = currentAMPM;
            if (initialFromTime && fromCalendarSide === "left") {
                const timeParts = initialFromTime.split(/[: ]/);
                leftHour = parseInt(timeParts[0]);
                leftMinute = parseInt(timeParts[1]);
                leftAMPM = timeParts[2];
            } else if (initialToTime && toCalendarSide === "left") {
                const timeParts = initialToTime.split(/[: ]/);
                leftHour = parseInt(timeParts[0]);
                leftMinute = parseInt(timeParts[1]);
                leftAMPM = timeParts[2];
            }

            if (initialFromTime && fromCalendarSide === "right") {
                const timeParts = initialFromTime.split(/[: ]/);
                rightHour = parseInt(timeParts[0]);
                rightMinute = parseInt(timeParts[1]);
                rightAMPM = timeParts[2];
            } else if (initialToTime && toCalendarSide === "right") {
                const timeParts = initialToTime.split(/[: ]/);
                rightHour = parseInt(timeParts[0]);
                rightMinute = parseInt(timeParts[1]);
                rightAMPM = timeParts[2];
            }
            timeHTMLLeft = `
                <div class="vin--time__picker vin--time__picker-left vinflex vinflex--justifycenter">
                    <form class="vin__range__time" aria-label="Select time range">
                        <label>From:</label>
                        <select class="vin-time-hour-left">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === leftHour ? "selected" : ""}>${i + 1}</option>`).join('')}</select> :
                        <select class="vin-time-minute-left">${Array.from({ length: 60 }, (_, i) => `<option ${i === leftMinute ? "selected" : ""}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
                        <select class="vin-time-ampm-left"><option ${leftAMPM === "AM" ? "selected" : ""}>AM</option><option ${leftAMPM === "PM" ? "selected" : ""}>PM</option></select>
                    </form>
                </div>`;
            timeHTMLRight = `
                <div class="vin--time__picker vin--time__picker-right vinflex vinflex--justifycenter">
                    <form class="vin__range__time">
                        <label>To:</label>
                        <select class="vin-time-hour-right">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === rightHour ? "selected" : ""}>${i + 1}</option>`).join('')}</select> :
                        <select class="vin-time-minute-right">${Array.from({ length: 60 }, (_, i) => `<option ${i === rightMinute ? "selected" : ""}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
                        <select class="vin-time-ampm-right"><option ${rightAMPM === "AM" ? "selected" : ""}>AM</option><option ${rightAMPM === "PM" ? "selected" : ""}>PM</option></select>
                    </form>
                </div>`;
            buttonHTML = `
                <div class="vin--datepicker-buttons vinflex vinflex--justifyend vin__canapply__sec">
                    <button type="button" class="vin-btn-cancel">Cancel</button>
                    <button type="button" class="vin-btn-apply">Apply</button>
                </div>`;
        }
        const body = `
            <div class="range__with__sidebar vinflex">
                ${sidebarHTML}
                <div class="vindaterangepicker--calendar vinflex">
                    <div class="vindaterangepicker--calendarleft vin--daterange__calendar">
                        ${renderHeader("left")}
                        ${renderCalendar(state.left.year, state.left.month, selectedFrom, null, selectedTo ? parseDate(selectedTo) : null, selectedTo, "left")}
                        ${timeHTMLLeft}
                    </div>
                    <div class="vindaterangepicker--calendarright vin--daterange__calendar">
                        ${renderHeader("right")}
                        ${renderCalendar(state.right.year, state.right.month, selectedTo, selectedFrom ? parseDate(selectedFrom) : null, null, selectedFrom, "right")}
                        ${timeHTMLRight}
                    </div>
                </div>
            </div>
            ${buttonHTML}
        `;
        $popup.html(body);
        attachEventListeners();
        attachArrowHandlers();
    }
    function attachArrowHandlers() {
        $popup.find(".vin-day-up[data-side='left']").off("click").on("click", function () {
            let newMonth = state.left.month - 1;
            let newYear = state.left.year;
            if (newMonth < 0) {
                newYear--;
                newMonth = 11;
            }
            if (newYear > state.right.year ||
                (newYear === state.right.year && newMonth > state.right.month)) {
                return;
            }
            if (selectedTo) {
                const toDate = new Date(selectedTo);
                const targetDate = new Date(newYear, newMonth, 1);
                if (targetDate > toDate) {
                    return;
                }
            }
            state.left.year = newYear;
            state.left.month = newMonth;
            renderCalendarSide("left");
            updateSidebarByMonth();
        });
        $popup.find(".vin-day-down[data-side='left']").off("click").on("click", function () {
            let newMonth = state.left.month + 1;
            let newYear = state.left.year;
            if (newMonth > 11) {
                newYear++;
                newMonth = 0;
            }
            if (newYear > today.getFullYear() ||
                (newYear === today.getFullYear() && newMonth > today.getMonth())) {
                return;
            }
            state.left.year = newYear;
            state.left.month = newMonth;
            renderCalendarSide("left");
            updateSidebarByMonth();
        });
        $popup.find(".vin-day-up[data-side='right']").off("click").on("click", function () {
            let newMonth = state.right.month - 1;
            let newYear = state.right.year;
            if (newMonth < 0) {
                newYear--;
                newMonth = 11;
            }
            if (newYear < state.left.year ||
                (newYear === state.left.year && newMonth < state.left.month)) {
                return;
            }
            if (selectedFrom) {
                const fromDate = new Date(selectedFrom);
                const lastDayOfMonth = new Date(newYear, newMonth + 1, 0);
                if (lastDayOfMonth < fromDate) {
                    return;
                }
            }
            state.right.year = newYear;
            state.right.month = newMonth;
            renderCalendarSide("right");
        });
        $popup.find(".vin-day-down[data-side='right']").off("click").on("click", function () {
            let newMonth = state.right.month + 1;
            let newYear = state.right.year;
            if (newMonth > 11) {
                newYear++;
                newMonth = 0;
            }
            if (newYear > today.getFullYear() ||
                (newYear === today.getFullYear() && newMonth > today.getMonth())) {
                state.right.year = today.getFullYear();
                state.right.month = today.getMonth();
                return;
            }
            state.right.year = newYear;
            state.right.month = newMonth;
            renderCalendarSide("right");
        });
    }
    function renderCalendarSide(side) {
        const year = state[side].year;
        const month = state[side].month;
        const selectedDate = side === "left" ? selectedFrom : selectedTo;
        const otherSelectedDate = side === "left" ? selectedTo : selectedFrom;
        const minDate = side === "right" && selectedFrom ? parseDate(selectedFrom) : null;
        const maxDate = side === "left" && selectedTo ? parseDate(selectedTo) : null;
        const html = renderCalendar(
            year,
            month,
            selectedDate,
            minDate,
            maxDate,
            otherSelectedDate,
            side
        );
        $popup.find(`.vindaterangepicker--calendar${side} .vincustom__year__clmn`).text(`${months[month]} ${year}`);
        $popup.find(`.vindaterangepicker--calendar${side} table`).replaceWith(html);
        attachDateClickEvents();
        attachHoverEvents();
    }
    function updateSidebarByMonth() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const diffMonths = (currentYear - state.left.year) * 12 + (currentMonth - state.left.month);
        const rightIsCurrentMonth = (state.right.year === currentYear && state.right.month === currentMonth);
        if (!rightIsCurrentMonth) {
            activeRange = null;
        } else {
            if (diffMonths === 0 && state.left.year === currentYear && state.left.month === currentMonth) {
                activeRange = "today";
            } else if (diffMonths === 1) {
                let lastMonthYear = currentYear;
                let lastMonth = currentMonth - 1;
                if (lastMonth < 0) {
                    lastMonth = 11;
                    lastMonthYear--;
                }
                if (state.left.year === lastMonthYear && state.left.month === lastMonth) {
                    activeRange = "last1";
                } else {
                    activeRange = null;
                }
            } else if (diffMonths === 2) {
                activeRange = "last2";
            } else if (diffMonths === 3) {
                activeRange = "last3";
            } else {
                activeRange = null;
            }
        }
        $popup.find(".vindaterangepicker--sidebar li").removeClass("active");
        if (activeRange) {
            $popup.find(`.vindaterangepicker--sidebar li[data-range="${activeRange}"]`).addClass("active");
        }
    }
    function updateApplyButton() {
        const $applyBtn = $popup.find(".vin-btn-apply");
        if (selectedFrom && selectedTo) $applyBtn.prop("disabled", false);
        else $applyBtn.prop("disabled", true);
    }
    function attachHoverEvents() {
        $popup.find("td").off("mouseenter mouseleave").on("mouseenter", function () {
            if (selectedFrom && !selectedTo) {
                const hoverDate = new Date($(this).data("date"));
                const start = new Date(selectedFrom);
                const begin = hoverDate < start ? hoverDate : start;
                const finish = hoverDate > start ? hoverDate : start;
                $popup.find("td").removeClass("vin__between__hover");
                $popup.find("td").each(function () {
                    const cellDate = new Date($(this).data("date"));
                    if (cellDate > begin && cellDate < finish) $(this).addClass("vin__between__hover");
                });
            }
        }).on("mouseleave", function () {
            if (!selectedTo) $popup.find("td").removeClass("vin__between__hover");
        });
    }
    function attachDateClickEvents() {
        $popup.find("td").off("click").on("click", function () {
            const $td = $(this);
            if ($td.hasClass("disabled") || !$td.data("date")) return;
            const calendarSide = $td.closest(".vin--daterange__calendar").hasClass("vindaterangepicker--calendarleft") ? "left" : "right";
            const clickedDate = new Date($td.data("date"));
            if (!selectedFrom && calendarSide === "right") {
                alert("Please select 'From' date first from the left calendar");
                return;
            }
            if (!selectedFrom || (selectedFrom && selectedTo)) {
                selectedFrom = $td.data("date");
                selectedTo = null;
                fromCalendarSide = calendarSide;
                toCalendarSide = null;
            } else {
                const fromDate = new Date(selectedFrom);
                if (clickedDate < fromDate) {
                    selectedTo = selectedFrom;
                    selectedFrom = $td.data("date");
                    toCalendarSide = fromCalendarSide;
                    fromCalendarSide = calendarSide;
                } else {
                    selectedTo = $td.data("date");
                    toCalendarSide = calendarSide;
                }
            }
            window.lastSelectedFrom = selectedFrom;
            window.lastSelectedTo = selectedTo;
            window.lastFromCalendarSide = fromCalendarSide;
            window.lastToCalendarSide = toCalendarSide;
            $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
            $popup.find("td").each(function () {
                const cellDate = new Date($(this).data("date"));
                const from = new Date(selectedFrom);
                const to = selectedTo ? new Date(selectedTo) : null;
                if (to) {
                    if (cellDate.getTime() === from.getTime() && cellDate.getTime() === to.getTime()) $(this).addClass("vin__equal__date");
                    else if (cellDate.getTime() === from.getTime()) $(this).addClass("vin__start__date");
                    else if (cellDate.getTime() === to.getTime()) $(this).addClass("vin__end__date");
                    else if (cellDate > from && cellDate < to) $(this).addClass("vin__between__dates");
                } else {
                    if (cellDate.getTime() === from.getTime()) $(this).addClass("vin__start__date");
                }
            });
            if (!isCustom && selectedFrom && selectedTo) {
                $container.find(".vindaterange--from__date").val(selectedFrom).trigger("change");
                $container.find(".vindaterange--to__date").val(selectedTo).trigger("change");
                if (isSingleInput) $input.val(`${selectedFrom} - ${selectedTo}`).trigger("change");
                $popup.remove();
            } else {
                updateApplyButton();
            }
        });
    }
    function attachEventListeners() {
        $popup.find(".vindaterangepicker--sidebar li").off("click").on("click", function () {
            const $li = $(this);
            $popup.find(".vindaterangepicker--sidebar li").removeClass("active");
            $li.addClass("active");
            activeRange = $li.data("range");
            window.lastActiveRange = activeRange;
            selectedFrom = null;
            selectedTo = null;
            fromCalendarSide = null;
            toCalendarSide = null;
            $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
            updateApplyButton();
            const now = new Date();
            let start = new Date(now);
            let end = new Date(now);
            switch (activeRange) {
                case "today": break;
                case "weekly": start.setDate(now.getDate() - 7); break;
                case "last10": start.setDate(now.getDate() - 10); break;
                case "last1": start.setMonth(now.getMonth() - 1); break;
                case "last2": start.setMonth(now.getMonth() - 2); break;
                case "last3": start.setMonth(now.getMonth() - 3); break;
                case "all": start = null; break;
            }
            state.left.year = start ? start.getFullYear() : now.getFullYear();
            state.left.month = start ? start.getMonth() : now.getMonth();
            state.right.year = end.getFullYear();
            state.right.month = end.getMonth();
            renderCalendarSide("left");
            renderCalendarSide("right");
        });
        attachHoverEvents();
        attachDateClickEvents();
        if (isCustom) {
            $popup.find(".vin-btn-cancel").off("click").on("click", () => {
                activeRange = "last1";
                window.lastActiveSidebarRange = "last1";
                let prevMonth = today.getMonth() - 1;
                let prevYear = today.getFullYear();
                if (prevMonth < 0) {
                    prevMonth = 11;
                    prevYear--;
                }
                window.lastLeftCalendar = {
                    year: prevYear,
                    month: prevMonth
                };
                window.lastRightCalendar = {
                    year: today.getFullYear(),
                    month: today.getMonth()
                };
                $popup.remove();
            });
            $popup.find(".vin-btn-apply").off("click").on("click", () => {
                if (!selectedFrom || !selectedTo) {
                    alert("Please select From and To date");
                    return;
                }
                const fromSide = fromCalendarSide;
                const toSide = toCalendarSide || (fromSide === "left" ? "right" : "left");
                const fromHour = $popup.find(`.vin-time-hour-${fromSide}`).val();
                const fromMinute = $popup.find(`.vin-time-minute-${fromSide}`).val();
                const fromAMPM = $popup.find(`.vin-time-ampm-${fromSide}`).val();
                const toHour = $popup.find(`.vin-time-hour-${toSide}`).val();
                const toMinute = $popup.find(`.vin-time-minute-${toSide}`).val();
                const toAMPM = $popup.find(`.vin-time-ampm-${toSide}`).val();
                const cleanFromDate = selectedFrom.split(" ")[0];
                const cleanToDate = selectedTo.split(" ")[0];
                const fromDateTime = `${cleanFromDate} ${fromHour.padStart(2, "0")}:${fromMinute.padStart(2, "0")} ${fromAMPM}`;
                const toDateTime = `${cleanToDate} ${toHour.padStart(2, "0")}:${toMinute.padStart(2, "0")} ${toAMPM}`;
                $container.find(".vindaterange--from__date").val(fromDateTime).trigger("change");
                $container.find(".vindaterange--to__date").val(toDateTime).trigger("change");
                if (isSingleInput) $input.val(`${fromDateTime} - ${toDateTime}`).trigger("change");
                window.lastActiveSidebarRange = $popup.find(".vindaterangepicker--sidebar li.active").data("range");
                window.lastLeftCalendar = {
                    year: state.left.year,
                    month: state.left.month
                };
                window.lastRightCalendar = {
                    year: state.right.year,
                    month: state.right.month
                };
                $popup.remove();
            });
        }
    }
    function formatRangeLabel(range) {
        switch (range) {
            case "all": return "All";
            case "last3": return "Last 3 Months";
            case "last2": return "Last 2 Months";
            case "last1": return "Last Month";
            case "last10": return "Last 10 Days";
            case "weekly": return "Weekly";
            case "today": return "Today";
        }
    }
    if (!window.lastActiveSidebarRange) {
        activeRange = "last1";
        window.lastActiveSidebarRange = "last1";
        let prevMonth = today.getMonth() - 1;
        let prevYear = today.getFullYear();
        if (prevMonth < 0) {
            prevMonth = 11;
            prevYear--;
        }
        state.left.year = prevYear;
        state.left.month = prevMonth;
    } else {
        activeRange = window.lastActiveSidebarRange;
    }
    if (window.lastLeftCalendar) {
        state.left.year = window.lastLeftCalendar.year;
        state.left.month = window.lastLeftCalendar.month;
    }
    if (window.lastRightCalendar) {
        state.right.year = window.lastRightCalendar.year;
        state.right.month = window.lastRightCalendar.month;
    }
    render();
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
    $(".vin--datepicker__container").each(function () {
        const $container = $(this);
        $container.find(".clear__selected__month").off("click").on("click", function () {
            $container.find(".vindaterange--from__date").val("").trigger("change");
            $container.find(".vindaterange--to__date").val("").trigger("change");
            const today = new Date();
            let prevMonth = today.getMonth() - 1;
            let prevYear = today.getFullYear();
            if (prevMonth < 0) {
                prevMonth = 11;
                prevYear--;
            }
            window.lastActiveSidebarRange = "last1";
            window.lastLeftCalendar = {
                year: prevYear,
                month: prevMonth
            };
            window.lastRightCalendar = {
                year: today.getFullYear(),
                month: today.getMonth()
            };
            window.lastSelectedFrom = null;
            window.lastSelectedTo = null;
            window.lastFromCalendarSide = null;
            window.lastToCalendarSide = null;
            const $popup = $container.find(".vindatepicker--dropdown__wrapp");
            if ($popup.length) {
                $popup.find(".vindaterangepicker--sidebar li").removeClass("active");
                $popup.find('.vindaterangepicker--sidebar li[data-range="last1"]').addClass("active");
                $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
            }
        });
    });
    return $popup;
}
(() => {
    const dateRangeInputs = document.querySelectorAll(".vindaterange--from__date, .vindaterange--to__date");
    dateRangeInputs.forEach(input => {
        input.addEventListener("focus", function () {
            showDateRangePicker(this);
        });
    });
})();

