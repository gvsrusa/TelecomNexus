import { Nav, Offcanvas } from 'react-bootstrap';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  expanded: boolean;
  items: NavItem[];
  activeItem?: string;
  onNavigate?: (id: string) => void;
  show?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  expanded,
  items,
  activeItem,
  onNavigate,
  show = true,
  onClose,
}: SidebarProps) {
  const width = expanded ? 240 : 60;

  return (
    <>
      <div
        className="d-none d-lg-flex flex-column border-end bg-body-tertiary"
        style={{
          width,
          minHeight: 'calc(100vh - 72px)',
          transition: 'width 200ms ease',
        }}
      >
        <Nav className="flex-column p-2">
          {items.map((item) => (
            <Nav.Link
              key={item.id}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                onNavigate?.(item.id);
              }}
              className={activeItem === item.id ? 'active' : ''}
            >
              {item.icon}
              {expanded && <span className="ms-2">{item.label}</span>}
            </Nav.Link>
          ))}
        </Nav>
      </div>
      <Offcanvas
        show={show}
        onHide={onClose}
        placement="start"
        className="d-lg-none"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {items.map((item) => (
              <Nav.Link
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate?.(item.id);
                  onClose?.();
                }}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
