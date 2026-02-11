'use client';

import type { ReactNode } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { ApolloWrapper } from '@/lib/apollo-provider';

function MFELayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar bg="success" data-bs-theme="dark" style={{ minHeight: 56 }}>
        <Container fluid>
          <Navbar.Brand href="/">Billing Console</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="/invoices">Invoices</Nav.Link>
            <Nav.Link href="/usage">Usage</Nav.Link>
            <Nav.Link href="/payments">Payments</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <main className="flex-grow-1 p-3 p-md-4">{children}</main>
      <footer className="border-top py-2 text-center text-muted bg-body-tertiary">
        <small>Billing Console MFE &mdash; Standalone Mode</small>
      </footer>
    </div>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ApolloWrapper>
      <MFELayout>{children}</MFELayout>
    </ApolloWrapper>
  );
}
