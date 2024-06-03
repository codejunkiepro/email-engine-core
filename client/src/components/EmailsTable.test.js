import React from 'react';
import { render, screen } from '@testing-library/react';
import EmailsTable from './EmailsTable';

describe('EmailsTable', () => {
    const data = [
        {
            subject: 'Test Email',
            sender_name: 'John Doe',
            sender: 'john@example.com',
            read: false,
            flag: false,
            timestamp: '2023-06-01T12:00:00Z',
        },
    ];

    test('renders without crashing and displays email data', () => {
        render(<EmailsTable data={data} />);

        expect(screen.getByText('Test Email')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('2023-06-01 12:00')).toBeInTheDocument();
    });
});
