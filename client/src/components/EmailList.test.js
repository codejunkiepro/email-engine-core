import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import EmailList from './EmailList';

jest.mock('axios');

describe('EmailList', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing and fetches user data', async () => {
        const user = { userId: '123', email: 'test@example.com' };
        axios.get.mockResolvedValue({ data: user });

        render(<EmailList />);

        await waitFor(() => expect(screen.getByText(`Email List For: ${user.userId}/${user.email}`)).toBeInTheDocument());
    });

    test('handles WebSocket errors', async () => {
        const user = { userId: '123', email: 'test@example.com' };
        axios.get.mockResolvedValue({ data: user });

        render(<EmailList />);

        const ws = new WebSocket('ws://localhost:4000');
        ws.onerror({ message: 'WebSocket error' });

        await waitFor(() => expect(screen.getByText('WebSocket error')).toBeInTheDocument());
    });

    test('handles API errors', async () => {
        axios.get.mockRejectedValue({ message: 'API error' });

        render(<EmailList />);

        await waitFor(() => expect(screen.getByText('API error')).toBeInTheDocument());
    });
});
