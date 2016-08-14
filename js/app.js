'use strict';
var loadEvents = function() {
    var eventSrcTpl = $('#tpl-event-item').html();
    var eventTpl = _.template(eventSrcTpl);
    var showEventsData = function(events) {
        var eventsHtml = '';
        var eventData = {};
        var startDate;
        var endDate;
        events.conference.forEach(function(event) {
            startDate = new Date(event.meta.startDate);
            endDate = new Date((event.meta.endDate || event.meta.startDate));
            eventData = {
                content: event.html,
                title: event.meta.title,
                place: event.meta.location,
                researchFields: event.meta.researchFields,
                link: event.meta.link,
                date: ''
            };
            eventsHtml += eventTpl(eventData);
        });
        $('.js_events_list').html(eventsHtml);
    };
    $.get('/data/events.json').done(showEventsData);
};
$(document).ready(function(){
    loadEvents();
});
