import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Episode } from 'src/app/models/Episode';
import { LogLevel } from 'src/app/models/LogLevel';
import { Podcast } from 'src/app/models/Podcast';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';

class DateRange {
  firstDay: Date;
  lastDay: Date;

  constructor(date?: Date | string) {
    if (!date) {
      date = new Date();
    }
    if (typeof date === 'string') {
      date = new Date(date);
    }
    this.firstDay = new Date(date.getFullYear(), date.getMonth(), 1);

    // Get the last day of the current month
    this.lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    this.lastDay.setSeconds(this.lastDay.getSeconds() - 1);
  }
  toString(): string {
    return `From: ${this.firstDay.toString()} to: ${this.lastDay.toString()}`;
  }

  dateInRange(date: Date | string): boolean {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date < this.lastDay && date >= this.firstDay;
  }
}
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public podcastID: any = this.globalService.PodcastID;
  public episodeList: any[] = [];
  calendarOptions!: CalendarOptions;
  calendar!: Calendar;
  isLoading: boolean = true;
  constructor(
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchEpisodes();
  }

  handleDateClick(arg: any) {
    console.log('episodeId ', arg.event._def.publicId);
    this.router.navigate([
      `/podcast/${this.globalService.PodcastID}/episode/${arg.event._def.publicId}`,
    ]); //TODO: add navigation to relevant episode
  }

  handleMonthChange(event: any) {
    const newDate = event.view.currentStart;
    console.log('newDate: ' + newDate);
  }

  //   calendarComponent: any;
  //   setCalendarInstance(calendar: any) {
  //     console.log('setCalendarInstance');
  //     this.calendarComponent = calendar;
  //   }
  //   nextMonth() {
  //     const calendarApi = this.calendarComponent.getApi();
  //     calendarApi.next();
  //   }

  fetchEpisodes(): void {
    const dateRange = new DateRange();
    console.log('DatRange', dateRange, toString());

    this.episodeService.get<Episode>(this.podcastID).subscribe(
      (response) => {
        this.episodeList = response;
        console.log('episodeList', this.episodeList);

        const filteredEpisodes = this.episodeList.filter(
          (episode: Episode) =>
            dateRange.dateInRange(episode.Published!) ||
            dateRange.dateInRange(episode.Scheduled)
        );
        console.log('filteredEpisodes', filteredEpisodes);

        const events: EventInput[] = filteredEpisodes.map(
          (episode: Episode) => {
            return {
              title: episode.Title,
              start: episode.Published || episode.Scheduled,
              id: episode._id,
            };
          }
        );
        console.log('events', events);

        this.calendarOptions = {
          plugins: [dayGridPlugin, interactionPlugin],
          initialView: 'dayGridMonth',
          eventClick: this.handleDateClick.bind(this),
          //   customButtons: {
          //     myCustomButton: {
          //       text: 'Next Month',
          //       click: this.nextMonth.bind(this),
          //     },
          //   },
          //   headerToolbar: {
          //     left: 'prev,myCustomButton today',
          //     center: 'title',
          //     right: 'dayGridMonth,timeGridWeek,timeGridDay',
          //   },
          events: events,
        };

        this.isLoading = false;
      },
      (error) => {
        this.globalService.logWriter(
          'Error fetching episodes:',
          error,
          LogLevel.ERROR
        );
      }
    );
  }
}
