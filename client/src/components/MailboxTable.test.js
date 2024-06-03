import React from 'react';
import { render, screen } from '@testing-library/react';
import MailboxTable from './MailboxTable';

describe('MailboxTable', () => {
    const data = [
        {
            mailbox_name: 'Inbox',
            total_emails: 100,
            unread_count: 5,
            last_sync: '2023-06-01T12:00:00Z',
        },
    ];

    test('renders without crashing and displays mailbox data', () => {
        render(<MailboxTable data={data} />);

        expect(screen.getByText('Inbox')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('2023-06-01 12:00')).toBeInTheDocument();
    });
});
