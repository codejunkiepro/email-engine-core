import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import AddAccount from './AddAccount';

jest.mock('axios');

describe('AddAccount', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        render(<AddAccount />);
        expect(screen.getByText('Add Account')).toBeInTheDocument();
    });

    test('handles account addition and displays OAuth URL', async () => {
        const oauthUrl = 'http://example.com/oauth';
        axios.post.mockResolvedValue({ data: { url: oauthUrl } });

        render(<AddAccount />);
        fireEvent.change(screen.getByPlaceholderText('Enter your userId'), { target: { value: 'testUserId' } });
        fireEvent.click(screen.getByText('Add Account'));

        await waitFor(() => expect(screen.getByText('Link Outlook Account')).toBeInTheDocument());
        expect(screen.getByText('Link Outlook Account').closest('a')).toHaveAttribute('href', oauthUrl);
    });

    test('handles API errors', async () => {
        axios.post.mockRejectedValue({ message: 'API error' });

        render(<AddAccount />);
        fireEvent.change(screen.getByPlaceholderText('Enter your userId'), { target: { value: 'testUserId' } });
        fireEvent.click(screen.getByText('Add Account'));

        await waitFor(() => expect(screen.queryByText('Link Outlook Account')).not.toBeInTheDocument());
    });
});
