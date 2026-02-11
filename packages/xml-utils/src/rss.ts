import { create } from 'xmlbuilder2';

export interface Alert {
  alertId: string;
  deviceId: string;
  severity: string;
  title: string;
  description: string;
  timestamp: Date;
}

export function generateAlertRssFeed(alerts: Alert[]): string {
  const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss', { version: '2.0' })
    .ele('channel')
    .ele('title').txt('TelecomNexus Alerts').up()
    .ele('link').txt('https://telecom-nexus.example.com/alerts').up()
    .ele('description').txt('Network alerts feed').up()
    .ele('language').txt('en-us').up();

  for (const a of alerts) {
    doc.ele('item')
      .ele('title').txt(a.title).up()
      .ele('description').txt(a.description).up()
      .ele('pubDate').txt(a.timestamp.toUTCString()).up()
      .ele('category').txt(a.severity).up()
      .ele('link').txt(`https://telecom-nexus.example.com/devices/${a.deviceId}`).up()
      .up();
  }

  return doc.end({ prettyPrint: true });
}
