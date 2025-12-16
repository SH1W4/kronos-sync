import { google } from 'googleapis'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

export interface CalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export class GoogleCalendarService {
  private calendar: any

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    this.calendar = google.calendar({ version: 'v3', auth })
  }

  static async fromSession() {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      throw new Error('No access token available')
    }

    return new GoogleCalendarService(session.accessToken as string)
  }

  async createEvent(event: CalendarEvent): Promise<string> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      })

      return response.data.id
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    try {
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: event,
      })
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      })
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      throw new Error('Failed to delete calendar event')
    }
  }

  async getEvents(timeMin: string, timeMax: string): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error fetching calendar events:', error)
      throw new Error('Failed to fetch calendar events')
    }
  }

  async syncBookingToCalendar(booking: {
    id: string
    clientName: string
    artistName: string
    startTime: Date
    endTime: Date
    description?: string
    clientEmail?: string
  }): Promise<string> {
    const event: CalendarEvent = {
      summary: `Tatuagem - ${booking.clientName}`,
      description: `
Sessão de tatuagem agendada via KRONOS SYNC

Cliente: ${booking.clientName}
Artista: ${booking.artistName}
${booking.description ? `Descrição: ${booking.description}` : ''}

ID do Agendamento: ${booking.id}
      `.trim(),
      start: {
        dateTime: booking.startTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: booking.endTime.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: booking.clientEmail ? [
        {
          email: booking.clientEmail,
          displayName: booking.clientName,
        }
      ] : undefined,
    }

    return await this.createEvent(event)
  }
}

