'use client';

import type { ReactNode } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { ApolloWrapper } from '@/lib/apollo-provider';

function MFELayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Navbar bg="primary" data-bs-theme="dark" style={{ minHeight: 56 }}>
        <Container fluid>
          <Navbar.Brand href="/">Customer Portal</Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="/account">Account</Nav.Link>
            <Nav.Link href="/plans">Plans</Nav.Link>
            <Nav.Link href="/tickets">Tickets</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
      <main className="flex-grow-1 p-3 p-md-4">{children}</main>
      <footer className="border-top py-2 text-center text-muted bg-body-tertiary">
        <small>Customer Portal MFE &mdash; Standalone Mode</small>
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
