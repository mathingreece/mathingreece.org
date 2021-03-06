/**
 * Engines ready, prepare to fly.
 */
var showEventsData = function(events) {
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var eventSrcTpl = $('#tpl-event-item').html();
    var eventTpl = _.template(eventSrcTpl);
    var yearSrcTpl = $('#tpl-year').html();
    var yearTpl = _.template(yearSrcTpl);
    var today = new Date();

    var olderEventsHtml = '';
    var upcomingEventsHtml = '';
    var pastEventsHtml = '';
    var seminarsHtml = '';
    var eventData = {};
    var startDate;
    var endDate;
    var date;
    var eventsByYear = [];
    events.conference = _.sortBy(events.conference, function(event) {
        return - new Date(event.meta.startDate).getTime();
    });
    _.each(events.conference, function(event) {
        startDate = undefined;
        endDate = undefined;
        date =  undefined;
        if (!event.meta.startDate) { return false; }
        startDate = new Date(event.meta.startDate);
        endDate = new Date((event.meta.endDate || event.meta.startDate));
        if (startDate.getUTCMonth() - endDate.getUTCMonth()) {
            date = startDate.getUTCDate() + ' ' + months[startDate.getUTCMonth()] + ' - ' + endDate.getUTCDate() + ' ' + months[endDate.getUTCMonth()] + ' ' + startDate.getFullYear();
        } else {
            date = startDate.getUTCDate() + ' - ' + endDate.getUTCDate() + ' ' + months[endDate.getUTCMonth()] + ' ' + startDate.getFullYear();
        }
        eventData = {
            content: event.html,
            title: event.meta.title,
            subtitle: event.meta.subTitle,
            place: event.meta.location,
            researchFields: event.meta.researchFields,
            link: event.meta.link,
            startDate: event.meta.startDate,
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
    });

    eventsByYear = _.sortBy(eventsByYear, function(event) {
        return - event.year;
    });
    _.each(eventsByYear, function(year) {
        var yearUpcomingHtml = '', yearPastHtml = '', yearHtml = '';
        var yearUpcomingEventsHtml = '',  yearPastEventsHtml = '';
        if (year.year == today.getFullYear()) {
            var d = new Date();
            _.each(year.events, function(event) {
                d = new Date(event.startDate);
                if (today < d) {
                    yearUpcomingEventsHtml += eventTpl(event);
                } else {
                    yearPastEventsHtml += eventTpl(event);
                }
            });

            yearUpcomingHtml = yearTpl({
                year: year.year,
                events: yearUpcomingEventsHtml
            });

            yearPastHtml = yearTpl({
                year: year.year,
                events: yearPastEventsHtml
            });
        } else {
            var eventsHtml = '';
            _.each(year.events, function(event) {
                eventsHtml += eventTpl(event);
            });

            yearHtml = yearTpl({
                year: year.year,
                events: eventsHtml
            });
        }

        var y = new Date('' + year.year + '');
        if (today < y) {
            upcomingEventsHtml += yearHtml;
        } else if (today.getFullYear() === year.year) {
            upcomingEventsHtml += (yearUpcomingEventsHtml) ? yearUpcomingHtml : '';
            pastEventsHtml += (yearPastEventsHtml) ? yearPastHtml : '';
        } else if (today.getFullYear() - year.year < 2) {
            pastEventsHtml += yearHtml;
        } else {
            olderEventsHtml += yearHtml;
        }
    });

    // Seminars
    var seminarCities = [];
    var existingCity = false;
    _.each(events.seminar, function(event) {
        existingCity = _.find(seminarCities, {name: event.meta.location}) || false;
        eventData = {
            content: event.html,
            title: event.meta.title,
            subtitle: event.meta.subTitle,
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
    });
    seminarCities = _.sortBy(seminarCities, function(city){
        return city.name;
    });
    _.each(seminarCities, function(city) {
        seminarsHtml += '<div class="city"><h4 class="city-name">' + city.name + '</h4><ul class="city-events">';
        _.each(city.events, function(event) {
            seminarsHtml += eventTpl(event);
        });
        seminarsHtml += '</ul></div>';
    });

    $('.js_older_events_list').html(olderEventsHtml);
    $('.js_upcoming_events_list').html(upcomingEventsHtml);
    $('.js_past_events_list').html(pastEventsHtml);
    $('.js_seminars').html(seminarsHtml);
};

var onFetchError = function(jqXHR, textStatus, errorThrown) {
    $('.js_upcoming_events_heading').css({'color': 'red'});
    $('.js_upcoming_events_list').html(textStatus + ' ' + errorThrown);
};

$(document).ready(function(){
    $.get('https://data.mathingreece.org/events.json').done(showEventsData).fail(onFetchError);
    $('.js_older_events_heading').click(function(e) {
        $('.js_older_events_list').toggleClass('hide');
    });
    // Back to top
    var $btnScrollTop = $('.js_backtotop');
    $btnScrollTop.click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        $btnScrollTop.addClass('hide');
        return false;
    });
    var scrollVal = 0;
    $(window).scroll(function(){
        scrollVal = $(this).scrollTop() || 0;
        if(scrollVal > 300) { $btnScrollTop.removeClass('hide'); }
        if(scrollVal < 299) { $btnScrollTop.addClass('hide'); }
    });
    $btnScrollTop.addClass('hide');
});
