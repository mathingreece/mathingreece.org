'use strict';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var loadEvents = function() {
    var eventSrcTpl = $('#tpl-event-item').html();
    var eventTpl = _.template(eventSrcTpl);
    var today = new Date();
    var showEventsData = function(events) {
        var olderEventsHtml = '';
        var upcomingAndRecentEventsHtml = '';
        var seminarsHtml = '';
        var eventData = {};
        var startDate;
        var endDate;
        var date;
        var eventsByYear = [];
        events.conference = _.sortBy(events.conference, function(event) {
            return - new Date(event.meta.startDate).getTime();
        });
        events.conference.forEach(function(event) {
            startDate = undefined;
            endDate = undefined;
            date =  undefined;
            if (!event.meta.startDate) { return false; }
            startDate = new Date(event.meta.startDate);
            endDate = new Date((event.meta.endDate || event.meta.startDate));
            // console.log(event.meta.startDate);
            // console.log(event.meta.endDate);
            if (startDate.getMonth() - endDate.getMonth()) {
                date = startDate.getDate() + ' ' + months[startDate.getMonth()] + ' - ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + startDate.getFullYear();
            } else {
                date = startDate.getDate() + ' - ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + startDate.getFullYear();
            }
            eventData = {
                content: event.html,
                title: event.meta.title,
                place: event.meta.location,
                researchFields: event.meta.researchFields,
                link: event.meta.link,
                date: date
            };
            var existingYear = _.find(eventsByYear, {year: startDate.getFullYear()});
            if (existingYear) {
                existingYear.events.push(eventData);
            } else {
                eventsByYear.push({
                    year: startDate.getFullYear(),
                    events: [eventData]
                });
            }
            // console.log(existingYear);
            // if (endDate) {
            //     // If event older than 3 years from current, place it to older events
            //     if (today.getFullYear() - endDate.getFullYear() < 3) {
            //         upcomingAndRecentEventsHtml += eventTpl(eventData);
            //     } else {
            //         olderEventsHtml += eventTpl(eventData);
            //     }
            // }
        });

        eventsByYear = _.sortBy(eventsByYear, function(event) {
            return - event.year;
        });
        eventsByYear.forEach(function(year) {
            var yearHtml = '<div class=""><h4 class="year-name">' + year.year + '</h4><ul class="year-events">'
            year.events.forEach(function(event){
                yearHtml += eventTpl(event);
            });
            yearHtml += '</ul></div>';

            if (today.getFullYear() - year.year < 3) {
                upcomingAndRecentEventsHtml += yearHtml;
            } else {
                olderEventsHtml += yearHtml;
            }
        });
        console.log(eventsByYear);

        // Seminars
        var seminarCities = [];
        var existingCity = false;
        events.seminar.forEach(function(event) {
            // console.log(event.meta.location);
            existingCity = _.find(seminarCities, {name: event.meta.location}) || false;
            eventData = {
                content: event.html,
                title: event.meta.title,
                // place: event.meta.location,
                place: false,
                researchFields: event.meta.researchFields,
                link: event.meta.link,
                date: null
            };
            if (existingCity) {
                existingCity.events.push(eventData);
            } else {
                seminarCities.push({
                    name: event.meta.location,
                    events: [eventData]
                });
            }
            // seminarsHtml += eventTpl(eventData);
        });
        // console.log(seminarCities);
        seminarCities = _.sortBy(seminarCities, function(city){
            return city.name;
        });
        seminarCities.forEach(function(city) {
            seminarsHtml += '<div class="city"><h4 class="city-name">' + city.name + '</h4><ul class="city-events">';
            city.events.forEach(function(event){
                seminarsHtml += eventTpl(event);
            });
            seminarsHtml += '</ul></div>';
        });

        $('.js_older_events_list').html(olderEventsHtml);
        $('.js_upcoming_n_recent_events_list').html(upcomingAndRecentEventsHtml);
        $('.js_seminars').html(seminarsHtml);
    };
    $.get('/data/events.json').done(showEventsData);
};
$(document).ready(function(){
    loadEvents();
    $('.js_past_events_heading').click(function(e) {
        $('.js_older_events_list').toggleClass('hide');
    });
});
