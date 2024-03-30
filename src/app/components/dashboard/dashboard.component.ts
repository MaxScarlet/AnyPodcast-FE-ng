import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import { co } from '@fullcalendar/core/internal-common';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Episode } from 'src/app/models/Episode';
import { LogLevel } from 'src/app/models/LogLevel';
import { Podcast } from 'src/app/models/Podcast';
import { EpisodeService } from 'src/app/services/episode.service';
import { GlobalService } from 'src/app/services/global.service';
import { PodcastService } from 'src/app/services/podcast.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public podcastID: any = this.globalService.PodcastID;
  public episodeList: any[] = [];
  calendar!: Calendar;
  calendarOptions!: CalendarOptions;
  dateRange = new DateRange();
  isLoading: boolean = true;
  constructor(
    private episodeService: EpisodeService,
    private globalService: GlobalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      // aspectRatio: 1.78,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: '',
      },
      eventTimeFormat: { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' },//, meridiem: false
      eventClick: this.handleEventClick.bind(this),
      datesSet: this.handleMonthChange.bind(this)
    };
    this.fetchEpisodes();
  }

  handleEventClick(arg: any) {
    this.router.navigate([
      `/podcast/${this.globalService.PodcastID}/episode/${arg.event._def.publicId}`,
    ]);
  }

  handleMonthChange(event: any) {
    this.dateRange = new DateRange(event.start, event.end);
    this.fetchEpisodes();
  }

  fetchEpisodes(): void {
    this.episodeService.get<Episode>(this.podcastID).subscribe(
      (response) => {
        this.episodeList = response;

        const filteredEpisodes = this.episodeList.filter(
          (episode: Episode) =>
            this.dateRange.dateInRange(episode.Published!) ||
            this.dateRange.dateInRange(episode.Scheduled)
        );

        const events: EventInput[] = filteredEpisodes.map(
          (episode: Episode) => {
            const event: EventInput = {
              title: episode.Title,
              start: episode.Published || episode.Scheduled,
              id: episode._id,
              color: episode.Published ? 'green' : 'chocolate',
            };
            const end = new Date(event.start?.toString()!);
            event.end = new Date(end.getTime() + 5 * 60000);
            return event;
          }
        );

        this.calendarOptions.events = events;

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
class DateRange {
  dateStart: Date;
  dateEnd: Date;

  constructor(start?: Date, end?: Date) {
    if (!start) {
      start = new Date();
      start = new Date(start.getFullYear(), start.getMonth(), 1);
    }
    this.dateStart = start;
    if (!end) {
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      end.setSeconds(end.getSeconds() - 1);
    }
    this.dateEnd = end;
  }
  toString(): string {
    return `From: ${this.dateStart.toString()} to: ${this.dateEnd.toString()}`;
  }

  dateInRange(date: Date | string): boolean {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date < this.dateEnd && date >= this.dateStart;
  }
}