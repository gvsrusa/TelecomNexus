import { describe, it, expect } from 'vitest';
import { generateAlertRssFeed, type Alert } from '../rss';

describe('generateAlertRssFeed', () => {
  const sampleAlerts: Alert[] = [
    {
      alertId: 'ALERT-001',
      deviceId: 'DEV-001',
      severity: 'CRITICAL',
      title: 'High CPU Usage',
      description: 'CPU usage exceeded 95% on Core Router 1',
      timestamp: new Date('2026-01-15T10:30:00.000Z'),
    },
    {
      alertId: 'ALERT-002',
      deviceId: 'DEV-002',
      severity: 'MAJOR',
      title: 'Memory Warning',
      description: 'Memory usage at 80%',
      timestamp: new Date('2026-01-15T11:00:00.000Z'),
    },
  ];

  it('generates valid XML with RSS 2.0 header', () => {
    const xml = generateAlertRssFeed(sampleAlerts);
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<channel>');
  });

  it('includes channel metadata', () => {
    const xml = generateAlertRssFeed(sampleAlerts);
    expect(xml).toContain('<title>TelecomNexus Alerts</title>');
    expect(xml).toContain('<language>en-us</language>');
  });

  it('includes all alert items', () => {
    const xml = generateAlertRssFeed(sampleAlerts);
    expect(xml).toContain('<title>High CPU Usage</title>');
    expect(xml).toContain('<title>Memory Warning</title>');
  });

  it('includes severity as category', () => {
    const xml = generateAlertRssFeed(sampleAlerts);
    expect(xml).toContain('<category>CRITICAL</category>');
    expect(xml).toContain('<category>MAJOR</category>');
  });

  it('includes device link in items', () => {
    const xml = generateAlertRssFeed(sampleAlerts);
    expect(xml).toContain('devices/DEV-001');
    expect(xml).toContain('devices/DEV-002');
  });

  it('handles empty alert array', () => {
    const xml = generateAlertRssFeed([]);
    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });
});
