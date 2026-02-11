import { Navbar, Nav, Container } from 'react-bootstrap';

export interface AppNavbarProps {
  user?: { name: string; email: string };
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  darkMode?: boolean;
}

export function AppNavbar({
  onToggleSidebar,
  onToggleTheme,
  darkMode = false,
}: AppNavbarProps) {
  return (
    <Navbar expand="lg" className="bg-body-tertiary" style={{ minHeight: 72 }}>
      <Container fluid>
        <Navbar.Brand href="/">TelecomNexus</Navbar.Brand>
        <Navbar.Toggle onClick={onToggleSidebar} aria-label="Toggle sidebar" />
        <Navbar.Collapse>
          <Nav className="ms-auto">
            {onToggleTheme && (
              <Nav.Link onClick={onToggleTheme} href="#" role="button">
                {darkMode ? '☀️' : '🌙'}
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
