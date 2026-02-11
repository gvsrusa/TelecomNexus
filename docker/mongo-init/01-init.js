// MongoDB initialization script for TelecomNexus
// Creates database, collections, and indexes

db = db.getSiblingDB('telecom_nexus');

// Create collections
const collections = ['customers', 'plans', 'tickets', 'invoices', 'payments', 'devices'];

collections.forEach(function (name) {
  if (!db.getCollectionNames().includes(name)) {
    db.createCollection(name);
    print('Created collection: ' + name);
  }
});

// Create indexes
db.customers.createIndex({ customerId: 1 }, { unique: true });
db.plans.createIndex({ planCode: 1 }, { unique: true });
db.tickets.createIndex({ ticketId: 1 }, { unique: true });
db.invoices.createIndex({ invoiceNumber: 1 }, { unique: true });
db.invoices.createIndex({ createdAt: 1 }, { expireAfterSeconds: 31536000 }); // TTL 365 days
db.payments.createIndex({ paymentId: 1 }, { unique: true });
db.devices.createIndex({ deviceId: 1 }, { unique: true });

print('MongoDB initialization complete.');
