'use client';

import { useState, useCallback } from 'react';
import { Navbar, Nav, Container, NavDropdown, Form, Offcanvas } from 'react-bootstrap';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-provider';
import { useAuth, DEMO_CUSTOMERS } from '@/lib/auth-context';

interface NavSection {
  title: string;
  icon: string;
  items: { id: string; label: string; href: string; icon: string }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Customer',
    icon: '\u{1F464}',
    items: [
      { id: 'account', label: 'Account', href: '/customer/account', icon: '\u{1F3E0}' },
      { id: 'plans', label: 'Plans', href: '/customer/plans', icon: '\u{1F4CB}' },
      { id: 'tickets', label: 'Tickets', href: '/customer/tickets', icon: '\u{1F3AB}' },
    ],
  },
  {
    title: 'NOC',
    icon: '\u{1F4E1}',
    items: [
      { id: 'topology', label: 'Topology', href: '/noc/topology', icon: '\u{1F310}' },
      { id: 'telemetry', label: 'Telemetry', href: '/noc/telemetry', icon: '\u{1F4C8}' },
      { id: 'alerts', label: 'Alerts', href: '/noc/alerts', icon: '\u{1F514}' },
    ],
  },
  {
    title: 'Billing',
    icon: '\u{1F4B3}',
    items: [
      { id: 'invoices', label: 'Invoices', href: '/billing/invoices', icon: '\u{1F4C4}' },
      { id: 'usage', label: 'Usage', href: '/billing/usage', icon: '\u{1F4CA}' },
      { id: 'payments', label: 'Payments', href: '/billing/payments', icon: '\u{1F4B0}' },
    ],
  },
];

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { darkMode, toggle } = useTheme();
  const { customerId, customerName, setCustomerId } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = useCallback(
    (href: string) => {
      router.push(href);
      setMobileMenuOpen(false);
    },
    [router],
  );

  const sidebarWidth = sidebarExpanded ? 240 : 60;

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Skip Navigation Link (Accessibility) */}
      <a
        href="#main-content"
        className="visually-hidden-focusable position-absolute top-0 start-0 p-3 bg-primary text-white z-3"
      >
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar
        expand="lg"
        className="border-bottom shadow-sm"
        style={{ minHeight: 72, zIndex: 1030 }}
        data-bs-theme={darkMode ? 'dark' : 'light'}
      >
        <Container fluid>
          <button
            className="btn btn-link text-decoration-none me-2 d-lg-block"
            onClick={() => {
              if (window.innerWidth < 992) {
                setMobileMenuOpen(true);
              } else {
                setSidebarExpanded(!sidebarExpanded);
              }
            }}
            aria-label="Toggle sidebar"
          >
            <span style={{ fontSize: '1.25rem' }}>{'\u2630'}</span>
          </button>
          <Navbar.Brand
            href="/"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              router.push('/');
            }}
            className="fw-bold"
            style={{ color: '#0066CC' }}
          >
            {'\u{1F4F6}'} TelecomNexus
          </Navbar.Brand>
          <div className="d-flex align-items-center ms-auto gap-2">
            {/* Customer Selector */}
            <Form.Select
              size="sm"
              style={{ maxWidth: 180 }}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="d-none d-md-block"
            >
              {DEMO_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            {/* Theme Toggle */}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {darkMode ? '\u2600\uFE0F' : '\u{1F319}'}
            </button>
            {/* User */}
            <NavDropdown
              title={<span className="d-none d-lg-inline">{customerName}</span>}
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={() => router.push('/customer/account')}>
                Profile
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => router.push('/')}>Logout</NavDropdown.Item>
            </NavDropdown>
          </div>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        {/* Desktop Sidebar */}
        <nav
          aria-label="Main navigation"
          className="d-none d-lg-flex flex-column border-end bg-body-tertiary"
          style={{
            width: sidebarWidth,
            minWidth: sidebarWidth,
            flexShrink: 0,
            minHeight: 'calc(100vh - 72px)',
            transition: 'width 200ms ease, min-width 200ms ease',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <Nav className="flex-column p-2 gap-1">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="mb-2">
                {sidebarExpanded && (
                  <small
                    className="text-muted text-uppercase fw-bold d-block px-2 mb-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    {section.title}
                  </small>
                )}
                {section.items.map((item) => (
                  <Nav.Link
                    key={item.id}
                    onClick={() => handleNav(item.href)}
                    aria-label={item.label}
                    aria-current={pathname === item.href ? 'page' : undefined}
                    className={`rounded px-2 py-2 ${pathname === item.href ? 'active bg-primary bg-opacity-10 text-primary fw-semibold' : ''}`}
                    style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    {sidebarExpanded && <span className="ms-2">{item.label}</span>}
                  </Nav.Link>
                ))}
              </div>
            ))}
          </Nav>
        </nav>

        {/* Mobile Offcanvas */}
        <Offcanvas
          show={mobileMenuOpen}
          onHide={() => setMobileMenuOpen(false)}
          placement="start"
          className="d-lg-none"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{'\u{1F4F6}'} TelecomNexus</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {/* Mobile Customer Selector */}
            <Form.Select
              size="sm"
              className="mb-3"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              {DEMO_CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Form.Select>
            <Nav className="flex-column gap-1">
              {NAV_SECTIONS.map((section) => (
                <div key={section.title} className="mb-3">
                  <small className="text-muted text-uppercase fw-bold d-block px-2 mb-1">
                    {section.icon} {section.title}
                  </small>
                  {section.items.map((item) => (
                    <Nav.Link
                      key={item.id}
                      onClick={() => handleNav(item.href)}
                      className={`rounded px-3 py-2 ${pathname === item.href ? 'active bg-primary bg-opacity-10 text-primary' : ''}`}
                    >
                      {item.icon} {item.label}
                    </Nav.Link>
                  ))}
                </div>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main
          id="main-content"
          className="flex-grow-1 p-3 p-md-4"
          role="main"
          tabIndex={-1}
          style={{ minWidth: 0, outline: 'none' }}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-top py-3 text-center text-muted bg-body-tertiary">
        <small>TelecomNexus Demo &mdash; Interview Project &copy; {new Date().getFullYear()}</small>
      </footer>
    </div>
  );
}
