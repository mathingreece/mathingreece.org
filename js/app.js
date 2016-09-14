'use strict';
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var loadEvents = function() {
    var eventSrcTpl = $('#tpl-event-item').html();
    var eventTpl = _.template(eventSrcTpl);
    var today = new Date();
    var showEventsData = function(events) {
        var pastEventsHtml = '';
        var upcomingEventsHtml = '';
        var seminarsHtml = '';
        var eventData = {};
        var startDate;
        var endDate;
        var date;
        events.conference = _.sortBy(events.conference, function(event) {
            return - new Date(event.meta.startDate).getTime();
        });
        events.conference.forEach(function(event) {
            startDate = undefined;
            endDate = undefined;
            date =  undefined;
            if (event.meta.startDate) {
                startDate = new Date(event.meta.startDate);
                endDate = new Date((event.meta.endDate || event.meta.startDate));
                // console.log(event.meta.startDate);
                // console.log(event.meta.endDate);
                if (startDate.getMonth() - endDate.getMonth()) {
                    date = startDate.getDate() + ' ' + months[startDate.getMonth()] + ' - ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + startDate.getFullYear();
                } else {
                    date = startDate.getDate() + ' - ' + endDate.getDate() + ' ' + months[endDate.getMonth()] + ' ' + startDate.getFullYear();
                }
            }
            eventData = {
                content: event.html,
                title: event.meta.title,
                place: event.meta.location,
                researchFields: event.meta.researchFields,
                link: event.meta.link,
                date: date
            };

            if (endDate) {
                if (endDate >= today) {
                    upcomingEventsHtml += eventTpl(eventData);
                } else {
                    pastEventsHtml += eventTpl(eventData);
                }
            }
        });
        events.seminar.forEach(function(event) {
            eventData = {
                content: event.html,
                title: event.meta.title,
                place: event.meta.location,
                researchFields: event.meta.researchFields,
                link: event.meta.link,
                date: null
            };
            seminarsHtml += eventTpl(eventData);
        });

        $('.js_past_events_list').html(pastEventsHtml);
        $('.js_upcoming_events_list').html(upcomingEventsHtml);
        $('.js_seminars').html(seminarsHtml);
    };
    $.get('/data/events.json').done(showEventsData);
};
$(document).ready(function(){
    loadEvents();
});
