import { Breadcrumb, Container } from 'react-bootstrap';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageContainerProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function PageContainer({
  title,
  breadcrumbs = [],
  children,
}: PageContainerProps) {
  return (
    <Container fluid className="py-4">
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-2">
          {breadcrumbs.map((b, i) =>
            b.href ? (
              <Breadcrumb.Item key={i} href={b.href}>
                {b.label}
              </Breadcrumb.Item>
            ) : (
              <Breadcrumb.Item key={i} active>
                {b.label}
              </Breadcrumb.Item>
            )
          )}
        </Breadcrumb>
      )}
      <h1 className="mb-4">{title}</h1>
      {children}
    </Container>
  );
}
