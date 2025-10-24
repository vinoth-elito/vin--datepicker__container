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
    function formatDateTime(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        const ampm = date.getHours() >= 12 ? "PM" : "AM";
        let hour12 = date.getHours() % 12 || 12;
        return `${y}-${m}-${d} ${String(hour12).padStart(2, '0')}:${min} ${ampm}`;
    }
    function formatDisplay(date) {
        const options = { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" };
        return date.toLocaleString(undefined, options);
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
                    Today <button class="vin-day-up">▲</button><button class="vin-day-down">▼</button>
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
                    if (minDate && dateObj < minDate) classes.push("vindatepicker--less__date", "disabled");
                    if (maxDate && dateObj > maxDate) classes.push("vindatepicker--greater__date", "disabled");
                    if (dateObj > today) classes.push("disabled");
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
    const minMonth = 0;
    const maxMonth = new Date().getMonth();
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
                ${ranges.map(r => `<li data-range="${r}" ${activeRange === r ? "class='active'" : ""}>${formatRangeLabel(r)}</li>`).join("")}
            </ul>
        </div>`;
        }
        let timeHTMLLeft = '', timeHTMLRight = '', buttonHTML = '';
        if (isCustom) {
            const now = new Date();
            let hour12 = now.getHours() % 12 || 12;
            let currentAMPM = now.getHours() >= 12 ? "PM" : "AM";
            let currentMinute = now.getMinutes();
            timeHTMLLeft = `
                <div class="vin--time__picker vin--time__picker-left vinflex vinflex--justifycenter">
                    <form class="vin__range__time" aria-label="Select time range">
                        <label>From:</label>
                        <select class="vin-time-hour-left">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === hour12 ? "selected" : ""}>${i + 1}</option>`).join('')}</select> :
                        <select class="vin-time-minute-left">${Array.from({ length: 60 }, (_, i) => `<option ${i === currentMinute ? "selected" : ""}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
                        <select class="vin-time-ampm-left"><option ${currentAMPM === "AM" ? "selected" : ""}>AM</option><option ${currentAMPM === "PM" ? "selected" : ""}>PM</option></select>
                    </form>
                </div>`;
            timeHTMLRight = `
                <div class="vin--time__picker vin--time__picker-right vinflex vinflex--justifycenter">
                    <form class="vin__range__time">
                        <label>To:</label>
                        <select class="vin-time-hour-right">${Array.from({ length: 12 }, (_, i) => `<option ${i + 1 === hour12 ? "selected" : ""}>${i + 1}</option>`).join('')}</select> :
                        <select class="vin-time-minute-right">${Array.from({ length: 60 }, (_, i) => `<option ${i === currentMinute ? "selected" : ""}>${String(i).padStart(2, '0')}</option>`).join('')}</select>
                        <select class="vin-time-ampm-right"><option ${currentAMPM === "AM" ? "selected" : ""}>AM</option><option ${currentAMPM === "PM" ? "selected" : ""}>PM</option></select>
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
                        ${renderCalendar(state.left.year, state.left.month, selectedFrom, null, null, selectedTo, "left")}
                        ${timeHTMLLeft}
                    </div>
                    <div class="vindaterangepicker--calendarright vin--daterange__calendar">
                        ${renderHeader("right")}
                        ${renderCalendar(state.right.year, state.right.month, selectedTo, minDate, null, selectedFrom, "right")}
                        ${timeHTMLRight}
                    </div>
                </div>
            </div>
            ${buttonHTML}
        `;
        $popup.html(body);
        if (!activeRange) {
            const $firstLi = $popup.find(".vindaterangepicker--sidebar li").first();
            if ($firstLi.length) {
                activeRange = $firstLi.data("range");
                $firstLi.addClass("active");
                const now = new Date();
                let start = new Date(now);
                switch (activeRange) {
                    case "today": break;
                    case "weekly": start.setDate(now.getDate() - 7); break;
                    case "last10": start.setDate(now.getDate() - 10); break;
                    case "last1": start.setMonth(now.getMonth() - 1); break;
                    case "last2": start.setMonth(now.getMonth() - 2); break;
                    case "last3": start.setMonth(now.getMonth() - 3); break;
                    case "all": start = now; break;
                }
                state.left.year = start.getFullYear();
                state.left.month = start.getMonth();
                renderCalendarSide("left");
            }
        }
        attachEventListeners();
        function openDatePicker() {
            render();
            updateSidebarByMonth();
        }
        function updateSidebarByMonth() {
            const now = new Date();
            const diffMonths = (now.getFullYear() - state.left.year) * 12 + (now.getMonth() - state.left.month);
            if (diffMonths === 0) activeRange = "today";
            else if (diffMonths === 1) activeRange = "last1";
            else if (diffMonths === 2) activeRange = "last2";
            else if (diffMonths === 3) activeRange = "last3";
            else activeRange = null;
            $popup.find(".vindaterangepicker--sidebar li").removeClass("active");
            if (activeRange) {
                $popup.find(`.vindaterangepicker--sidebar li[data-range="${activeRange}"]`).addClass("active");
            }
        }
        $popup.find(".vin-day-up").off("click").on("click", function () {
            if (state.left.month === 0) {
                state.left.year--;
                state.left.month = 11;
            } else {
                state.left.month--;
            }
            render();
            updateArrowButtons();
        });
        $popup.find(".vin-day-down").off("click").on("click", function () {
            const today = new Date();
            if (state.left.year < today.getFullYear() || (state.left.year === today.getFullYear() && state.left.month < today.getMonth())) {
                if (state.left.month === 11) {
                    state.left.year++;
                    state.left.month = 0;
                } else {
                    state.left.month++;
                }
                render();
            }
            updateArrowButtons();
        });
        function updateArrowButtons() {
            const today = new Date();
            $popup.find(".vin-day-down").prop(
                "disabled",
                state.left.year === today.getFullYear() && state.left.month === today.getMonth()
            );
            $popup.find(".vin-day-up").prop("disabled", false);
        }
        updateArrowButtons();
        function renderCalendarSide(side) {
            const year = state[side].year;
            const month = state[side].month;
            const selectedDate = side === "left" ? selectedFrom : selectedTo;
            const otherSelectedDate = side === "left" ? selectedTo : selectedFrom;
            const minDate = side === "right" && selectedFrom ? parseDate(selectedFrom) : null;
            const html = renderCalendar(year, month, selectedDate, minDate, null, otherSelectedDate, side);
            if (side === "left") {
                $popup.find(".vindaterangepicker--calendarleft .vin--daterange__calendar").html(html);
            } else {
                $popup.find(".vindaterangepicker--calendarright .vin--daterange__calendar").html(html);
            }
        }
        function updateApplyButton() {
            const $applyBtn = $popup.find(".vin-btn-apply");
            if (selectedFrom && selectedTo) $applyBtn.prop("disabled", false);
            else $applyBtn.prop("disabled", true);
        }
        function attachEventListeners() {
            const now = new Date();
            if (typeof window.lastActiveRange === "undefined") window.lastActiveRange = null;
            if (typeof window.lastSelectedFrom === "undefined") window.lastSelectedFrom = null;
            if (typeof window.lastSelectedTo === "undefined") window.lastSelectedTo = null;
            if (typeof window.lastFromCalendarSide === "undefined") window.lastFromCalendarSide = null;
            if (typeof window.lastToCalendarSide === "undefined") window.lastToCalendarSide = null;

            if (window.lastActiveRange) activeRange = window.lastActiveRange;
            if (window.lastSelectedFrom) selectedFrom = window.lastSelectedFrom;
            if (window.lastSelectedTo) selectedTo = window.lastSelectedTo;
            if (window.lastFromCalendarSide) fromCalendarSide = window.lastFromCalendarSide;
            if (window.lastToCalendarSide) toCalendarSide = window.lastToCalendarSide;
            $popup.find(".vindaterangepicker--sidebar li").removeClass("active");
            if (selectedFrom || selectedTo) {
                $popup.find(`.vindaterangepicker--sidebar li[data-range="${window.lastActiveRange}"]`).addClass("active");
            } else {
                const $firstLi = $popup.find(".vindaterangepicker--sidebar li").first();
                $firstLi.addClass("active");
                activeRange = $firstLi.data("range");
                window.lastActiveRange = activeRange;
            }
            if (activeRange) {
                $popup.find(`.vindaterangepicker--sidebar li[data-range="${activeRange}"]`).addClass("active");
            }
            $popup.find(".vindaterangepicker--sidebar li").off("click").on("click", function () {
                const $li = $(this);
                activeRange = $li.data("range");
                window.lastActiveRange = activeRange;
                $popup.find(".vindaterangepicker--sidebar li").removeClass("active");

                $li.addClass("active");
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
                $popup.find(".vindaterangepicker--calendarleft table").replaceWith(
                    renderCalendar(state.left.year, state.left.month, null, null, null, null, "left")
                );
                $popup.find(".vindaterangepicker--calendarright table").replaceWith(
                    renderCalendar(state.right.year, state.right.month, null, null, null, null, "right")
                );
                $popup.find(".vindatepicker--dropdown__wrapp__headernav .vin--textcenter").first()
                    .text(`${months[state.left.month]} ${state.left.year}`);
                $popup.find(".vindatepicker--dropdown__wrapp__headernav .vin--textcenter").last()
                    .text(`${months[state.right.month]} ${state.right.year}`);
                attachHoverEvents();
                attachDateClickEvents();
            });
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
                    if (!selectedFrom || (selectedFrom && selectedTo)) {
                        selectedFrom = $td.data("date");
                        selectedTo = null;
                        fromCalendarSide = calendarSide;
                        toCalendarSide = null;
                    } else {
                        selectedTo = $td.data("date");
                        toCalendarSide = calendarSide;
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
                    attachHoverEvents();
                    updateApplyButton();
                });
            }
            attachHoverEvents();
            attachDateClickEvents();
            $popup.find(".vin-day-up").off("click").on("click", function () {
                if (state.left.month === 0) {
                    state.left.year--;
                    state.left.month = 11;
                } else state.left.month--;
                renderCalendarSide("left");
            });
            $popup.find(".vin-day-down").off("click").on("click", function () {
                if (state.left.month === 11) {
                    state.left.year++;
                    state.left.month = 0;
                } else state.left.month++;
                renderCalendarSide("left");
            });
            $popup.find("td").off("click").on("click", function () {
                const $td = $(this);
                if ($td.hasClass("disabled") || !$td.data("date")) return;
                const cellDate = new Date($td.data("date"));
                if (!selectedFrom || (selectedFrom && selectedTo)) {
                    selectedFrom = cellDate;
                    selectedTo = null;
                } else {
                    selectedTo = cellDate;
                    if (selectedFrom.getTime() === selectedTo.getTime()) {
                        selectedTo = selectedFrom;
                    }
                }
                $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__dates vin__equal__date");
                $popup.find("td").each(function () {
                    const d = new Date($(this).data("date"));
                    if (selectedFrom && selectedTo) {
                        if (d.getTime() === selectedFrom.getTime() && d.getTime() === selectedTo.getTime()) $(this).addClass("vin__equal__date");
                        else if (d.getTime() === selectedFrom.getTime()) $(this).addClass("vin__start__date");
                        else if (d.getTime() === selectedTo.getTime()) $(this).addClass("vin__end__date");
                        else if (d > selectedFrom && d < selectedTo) $(this).addClass("vin__between__dates");
                    } else if (selectedFrom) {
                        if (d.getTime() === selectedFrom.getTime()) $(this).addClass("vin__start__date");
                    }
                });
                if (selectedFrom && selectedTo) {
                    $popup.find(".vin-btn-apply").removeClass("disabled");
                } else {
                    $popup.find(".vin-btn-apply").addClass("disabled");
                }
                renderCalendarSide("left");
                renderCalendarSide("right");
            });
            function updateTime(isFrom, hours, minutes) {
                if (isFrom) {
                    if (!selectedFrom) selectedFrom = new Date();
                    selectedFrom.setHours(hours, minutes, 0, 0);
                } else {
                    if (!selectedTo) selectedTo = new Date();
                    selectedTo.setHours(hours, minutes, 0, 0);
                }
                renderCalendarSide("left");
                renderCalendarSide("right");
                applyDateClasses();
            }
            function applyDateClasses() {
                $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__dates vin__equal__date");
                $popup.find("td").each(function () {
                    const cellDate = new Date($(this).data("date"));
                    const from = selectedFrom ? new Date(selectedFrom) : null;
                    const to = selectedTo ? new Date(selectedTo) : null;
                    if (from && to) {
                        if (cellDate.getTime() === from.getTime() && cellDate.getTime() === to.getTime()) {
                            $(this).addClass("vin__equal__date");
                        } else if (cellDate.getTime() === from.getTime()) {
                            $(this).addClass("vin__start__date");
                        } else if (cellDate.getTime() === to.getTime()) {
                            $(this).addClass("vin__end__date");
                        } else if (cellDate > from && cellDate < to) {
                            $(this).addClass("vin__between__dates");
                        }
                    } else if (from) {
                        if (cellDate.getTime() === from.getTime()) $(this).addClass("vin__start__date");
                    }
                });
            }
            $popup.find(".vin-btn-cancel").off("click").on("click", () => $popup.remove());
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
                const fromDateTime = `${selectedFrom} ${fromHour.padStart(2, "0")}:${fromMinute.padStart(2, "0")} ${fromAMPM}`;
                const toDateTime = `${selectedTo} ${toHour.padStart(2, "0")}:${toMinute.padStart(2, "0")} ${toAMPM}`;
                $container.find(".vindaterange--from__date").val(fromDateTime).trigger("change");
                $container.find(".vindaterange--to__date").val(toDateTime).trigger("change");
                if (isSingleInput) $input.val(`${fromDateTime} - ${toDateTime}`).trigger("change");
                $popup.remove();
            });
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
        $popup.find("td").off("click").on("click", function () {
            const $td = $(this);
            if ($td.hasClass("disabled") || !$td.data("date")) return;
            const date = $td.data("date");
            const $calendar = $td.closest(".vin--daterange__calendar");
            const calendarSide = $calendar.hasClass("vindaterangepicker--calendarleft") ? "left" : "right";
            if (!selectedFrom && calendarSide === "right") {
                alert("Please select From date first");
                return;
            }
            if (!selectedFrom || (selectedFrom && selectedTo)) {
                selectedFrom = date;
                selectedTo = null;
                fromCalendarSide = calendarSide;
                toCalendarSide = null;
                $td.addClass("vin__start__date").removeClass("vin__end__date vin__between__hover");
            } else {
                selectedTo = date;
                toCalendarSide = calendarSide;
                $td.addClass("vin__end__date").removeClass("vin__start__date vin__between__hover");
                const start = new Date(selectedFrom);
                const end = new Date(selectedTo);
                const begin = start < end ? start : end;
                const finish = start > end ? start : end;
                $popup.find("td").each(function () {
                    const cellDate = new Date($(this).data("date"));
                    $(this).removeClass("vin__between__hover");
                    if (cellDate > begin && cellDate < finish) $(this).addClass("vin__between__hover");
                });
            }
            if (!isCustom && selectedFrom && selectedTo) {
                $container.find(".vindaterange--from__date").val(selectedFrom).trigger("change");
                $container.find(".vindaterange--to__date").val(selectedTo).trigger("change");
                if (isSingleInput) $input.val(`${selectedFrom} - ${selectedTo}`).trigger("change");
                $popup.remove();
            }
        });
        let lastFromTime = "";
        let lastToTime = "";
        $popup.find("td").off("mouseenter mouseleave");
        $popup.find("td").on("mouseenter", function () {
            const $td = $(this);
            if ($td.hasClass("disabled") || !$td.data("date")) return;
            const hoverDate = new Date($td.data("date"));
            if (selectedFrom && !selectedTo) {
                const start = new Date(selectedFrom);
                const end = hoverDate > start ? hoverDate : start;
                const begin = hoverDate < start ? hoverDate : start;
                $popup.find("td").removeClass("vin__between__hover");
                $popup.find("td").each(function () {
                    const cellDate = new Date($(this).data("date"));
                    if (cellDate > begin && cellDate < end) {
                        $(this).addClass("vin__between__hover");
                    }
                });
            }
        }).on("mouseleave", function () {
            if (!selectedTo) $popup.find("td").removeClass("vin__between__hover");
        });
        if (isCustom) {
            $popup.find(".vin-btn-cancel").off("click").on("click", () => {
                $popup.find(".vindaterange--from__date").val("").trigger("change");
                $popup.find(".vindaterange--to__date").val("").trigger("change");
                if (isSingleInput) $popup.find($input).val("").trigger("change");
                selectedFrom = null;
                selectedTo = null;
                fromCalendarSide = null;
                toCalendarSide = null;
                const $sidebarLis = $popup.find(".vindaterangepicker--sidebar li");
                $sidebarLis.removeClass("active");
                const $firstLi = $sidebarLis.first();
                $firstLi.addClass("active");
                activeRange = $firstLi.data("range");
                window.lastActiveRange = activeRange;
                $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
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
                $popup.find(".vindaterangepicker--calendarleft table").replaceWith(
                    renderCalendar(state.left.year, state.left.month, null, null, null, null, "left")
                );
                $popup.find(".vindaterangepicker--calendarright table").replaceWith(
                    renderCalendar(state.right.year, state.right.month, null, null, null, null, "right")
                );
                $popup.find(".vindatepicker--dropdown__wrapp__headernav .vin--textcenter").first()
                    .text(`${months[state.left.month]} ${state.left.year}`);
                $popup.find(".vindatepicker--dropdown__wrapp__headernav .vin--textcenter").last()
                    .text(`${months[state.right.month]} ${state.right.year}`);
                updateApplyButton();
                $popup.remove();
            });
            let lastFromTime = null;
            let lastToTime = null;
            function prefillTime() {
                if (lastFromTime && lastFromTime.includes(":")) {
                    const [fh, fm, fampm] = lastFromTime.split(/[: ]/);
                    if (fromCalendarSide === "left") {
                        $popup.find(".vin-time-hour-left").val(fh);
                        $popup.find(".vin-time-minute-left").val(fm);
                        $popup.find(".vin-time-ampm-left").val(fampm);
                    } else {
                        $popup.find(".vin-time-hour-right").val(fh);
                        $popup.find(".vin-time-minute-right").val(fm);
                        $popup.find(".vin-time-ampm-right").val(fampm);
                    }
                }
                if (lastToTime && lastToTime.includes(":")) {
                    const [th, tm, tampm] = lastToTime.split(/[: ]/);
                    if (toCalendarSide === "left") {
                        $popup.find(".vin-time-hour-left").val(th);
                        $popup.find(".vin-time-minute-left").val(tm);
                        $popup.find(".vin-time-ampm-left").val(tampm);
                    } else {
                        $popup.find(".vin-time-hour-right").val(th);
                        $popup.find(".vin-time-minute-right").val(tm);
                        $popup.find(".vin-time-ampm-right").val(tampm);
                    }
                }
            }
            prefillTime();
            $popup.find(".vin-time-hour-left, .vin-time-minute-left, .vin-time-ampm-left, .vin-time-hour-right, .vin-time-minute-right, .vin-time-ampm-right")
                .off("change").on("change", function () {
                    const fromSide = fromCalendarSide;
                    const toSide = toCalendarSide || (fromSide === "left" ? "right" : "left");
                    lastFromTime = `${(fromSide === "left" ? $popup.find(".vin-time-hour-left") : $popup.find(".vin-time-hour-right")).val().padStart(2, '0')}:` +
                        `${(fromSide === "left" ? $popup.find(".vin-time-minute-left") : $popup.find(".vin-time-minute-right")).val().padStart(2, '0')} ` +
                        `${fromSide === "left" ? $popup.find(".vin-time-ampm-left") : $popup.find(".vin-time-ampm-right").val()}`;

                    lastToTime = `${(toSide === "left" ? $popup.find(".vin-time-hour-left") : $popup.find(".vin-time-hour-right")).val().padStart(2, '0')}:` +
                        `${(toSide === "left" ? $popup.find(".vin-time-minute-left") : $popup.find(".vin-time-minute-right")).val().padStart(2, '0')} ` +
                        `${(toSide === "left" ? $popup.find(".vin-time-ampm-left") : $popup.find(".vin-time-ampm-right")).val()}`;

                    console.log("Updated From Time:", lastFromTime);
                    console.log("Updated To Time:", lastToTime);
                });
            $popup.find("td").off("click").on("click", function () {
                const $td = $(this);
                if ($td.hasClass("disabled") || !$td.data("date")) return;
                const date = $td.data("date");
                const $calendar = $td.closest(".vin--daterange__calendar");
                const calendarSide = $calendar.hasClass("vindaterangepicker--calendarleft") ? "left" : "right";
                if (!selectedFrom || (selectedFrom && selectedTo)) {
                    selectedFrom = date;
                    selectedTo = null;
                    fromCalendarSide = calendarSide;
                    toCalendarSide = null;

                    $popup.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
                    $td.addClass("vin__start__date");
                }
                else {
                    selectedTo = date;
                    toCalendarSide = calendarSide;
                    $popup.find("td").removeClass("vin__end__date vin__between__dates vin__equal__date");
                    const start = new Date(selectedFrom);
                    const end = new Date(selectedTo);
                    const begin = start < end ? start : end;
                    const finish = start > end ? start : end;
                    $popup.find("td").each(function () {
                        const cellDate = new Date($(this).data("date"));
                        if (cellDate.getTime() === start.getTime() || cellDate.getTime() === end.getTime()) {
                            $(this).addClass(cellDate.getTime() === start.getTime() ? "vin__start__date" : "vin__end__date");
                        } else if (cellDate > begin && cellDate < finish) {
                            $(this).addClass("vin__between__dates");
                        }
                    });
                    if (start.getTime() === end.getTime()) {
                        $popup.find(`td[data-date="${selectedFrom}"]`).addClass("vin__equal__date");
                    }
                }
                $popup.find(".vin-btn-apply").prop("disabled", !selectedFrom || !selectedTo);
            });
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
            $popup.find(".vin-btn-apply").off("click").on("click", function () {
                if (!selectedFrom || !selectedTo) {
                    alert("Please fill the dates");
                    return;
                }
                const fromSide = fromCalendarSide;
                const toSide = toCalendarSide || (fromSide === "left" ? "right" : "left");
                const fromHour = fromSide === "left" ? $popup.find(".vin-time-hour-left").val() : $popup.find(".vin-time-hour-right").val();
                const fromMinute = fromSide === "left" ? $popup.find(".vin-time-minute-left").val() : $popup.find(".vin-time-minute-right").val();
                const fromAMPM = fromSide === "left" ? $popup.find(".vin-time-ampm-left").val() : $popup.find(".vin-time-ampm-right").val();
                lastFromTime = `${fromHour.padStart(2, '0')}:${fromMinute.padStart(2, '0')} ${fromAMPM}`;
                const toHour = toSide === "left" ? $popup.find(".vin-time-hour-left").val() : $popup.find(".vin-time-hour-right").val();
                const toMinute = toSide === "left" ? $popup.find(".vin-time-minute-left").val() : $popup.find(".vin-time-minute-right").val();
                const toAMPM = toSide === "left" ? $popup.find(".vin-time-ampm-left").val() : $popup.find(".vin-time-ampm-right").val();
                lastToTime = `${toHour.padStart(2, '0')}:${toMinute.padStart(2, '0')} ${toAMPM}`;
                const fromDateTime = `${formatDateSafe(selectedFrom)} ${lastFromTime}`;
                const toDateTime = `${formatDateSafe(selectedTo)} ${lastToTime}`;
                $container.find(".vindaterange--from__date").val(fromDateTime).trigger("change");
                $container.find(".vindaterange--to__date").val(toDateTime).trigger("change");
                if (isSingleInput) $input.val(`${fromDateTime} - ${toDateTime}`).trigger("change");
                $popup.remove();
            });
        }
    }
    render();
    $popup.on("click", ".vindatepicker--headernav__prev,.vindatepicker--headernav__next", function () {
        const side = $(this).data("side");
        if (!state[side]) return;
        if ($(this).hasClass("vindatepicker--headernav__prev")) {
            state[side].month--; if (state[side].month < 0) { state[side].month = 11; state[side].year--; }
        } else {
            state[side].month++; if (state[side].year > today.getFullYear() || (state[side].year === today.getFullYear() && state[side].month > today.getMonth())) { state[side].month = today.getMonth(); state[side].year = today.getFullYear(); }
        }
        render();
    });
    $(document).on("mousedown.cuzpicker", function (e) {
        if (!$popup.is(e.target) && $popup.has(e.target).length === 0 && !$input.is(e.target)) {
            $popup.remove();
            $(document).off("mousedown.cuzpicker");
        }
    });
    return $popup;
}
$(".vin--datepicker__container").each(function () {
    const $container = $(this);
    $container.find(".clear__selected__month").off("click").on("click", function () {
        $container.find(".vindaterange--from__date").val("").trigger("change");
        $container.find(".vindaterange--to__date").val("").trigger("change");
        $container.find(".vindaterangepicker--sidebar li").removeClass("active");
        const $firstLi = $container.find(".vindaterangepicker--sidebar li").first();
        $firstLi.addClass("active");
        selectedFrom = null;
        selectedTo = null;
        fromCalendarSide = null;
        toCalendarSide = null;
        activeRange = $firstLi.data("range");
        window.lastActiveRange = activeRange;
        $container.find("td").removeClass("vin__start__date vin__end__date vin__between__hover vin__between__dates vin__equal__date");
        updateApplyButton();
    });
});
(() => {
    const dateRangeInputs = document.querySelectorAll(".vindaterange--from__date, .vindaterange--to__date");
    dateRangeInputs.forEach(input => {
        input.addEventListener("focus", function () {
            showDateRangePicker(this);
        });
    });
})();
