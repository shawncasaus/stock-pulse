import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StockSearchSelector from '@/components/StockSearchSelector'
import { useStockStore } from '@/store/useStockStore'

// Reset Zustand store between tests
beforeEach(() => {
  useStockStore.setState({
    selectedStocks: [],
    shouldFetchChart: false,
  })
})

describe('StockSearchSelector', () => {
  describe('Initial render', () => {
    it('renders the search input', () => {
      render(<StockSearchSelector />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('shows default placeholder text', () => {
      render(<StockSearchSelector />)
      expect(
        screen.getByPlaceholderText('Search stocks like AAPL, Tesla, Microsoft...')
      ).toBeInTheDocument()
    })

    it('does not show selected stocks section when none selected', () => {
      render(<StockSearchSelector />)
      expect(screen.queryByRole('list', { name: 'Selected stocks' })).not.toBeInTheDocument()
    })
  })

  describe('Search input', () => {
    it('updates the input value as user types', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'AAPL')
      expect(input).toHaveValue('AAPL')
    })

    it('shows dropdown when typing a query', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'apple')

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
      })
    })

    it('does not show dropdown when input is empty', () => {
      render(<StockSearchSelector />)
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('shows clear button when there is a query', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')

      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
    })

    it('clears the input when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)
      const input = screen.getByRole('textbox')

      await user.type(input, 'AAPL')
      await user.click(screen.getByRole('button', { name: 'Clear search' }))

      expect(input).toHaveValue('')
    })

    it('closes dropdown when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.click(screen.getByRole('button', { name: 'Clear search' }))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })

  describe('Search results', () => {
    it('shows results matching the query', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')

      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
      })
    })

    it('shows empty state when no results match', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'ZZZZNOTASTOCK')

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument()
        expect(screen.queryAllByRole('option')).toHaveLength(0)
      })
    })

    it('closes dropdown on Escape key', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.keyboard('{Escape}')
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })

    it('navigates results with ArrowDown and ArrowUp keys', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      // 'AA' matches AAPL, AAL, AAP, and others — guaranteed multiple results
      await user.type(screen.getByRole('textbox'), 'AA')

      await waitFor(() => {
        expect(screen.getAllByRole('option').length).toBeGreaterThanOrEqual(2)
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() =>
        expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
      )

      await user.keyboard('{ArrowDown}')
      await waitFor(() =>
        expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true')
      )

      await user.keyboard('{ArrowUp}')
      await waitFor(() =>
        expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
      )
    })
  })

  describe('Stock selection', () => {
    it('adds a stock when a result is clicked', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')

      await waitFor(() => {
        const options = screen.getAllByRole('option')
        expect(options.length).toBeGreaterThan(0)
      })

      const aaplOption = screen.getAllByRole('option').find((o) =>
        o.textContent?.includes('AAPL')
      )
      expect(aaplOption).toBeDefined()
      await user.click(aaplOption!)

      expect(useStockStore.getState().selectedStocks).toContain('AAPL')
    })

    it('adds a stock via Enter key', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.keyboard('{ArrowDown}')
      await user.keyboard('{Enter}')

      expect(useStockStore.getState().selectedStocks.length).toBeGreaterThan(0)
    })

    it('shows selected stock as a chip', async () => {
      const user = userEvent.setup()
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')
      await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0))

      const aaplOption = screen.getAllByRole('option').find((o) =>
        o.textContent?.includes('AAPL')
      )
      await user.click(aaplOption!)

      expect(screen.getByRole('list', { name: 'Selected stocks' })).toBeInTheDocument()
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })

    it('removes a stock when its chip remove button is clicked', async () => {
      const user = userEvent.setup()
      useStockStore.setState({ selectedStocks: ['AAPL'] })
      render(<StockSearchSelector />)

      await user.click(screen.getByRole('button', { name: 'Remove AAPL' }))

      expect(useStockStore.getState().selectedStocks).not.toContain('AAPL')
    })

    it('clears all stocks when "Clear all" is clicked', async () => {
      const user = userEvent.setup()
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA'] })
      render(<StockSearchSelector />)

      await user.click(screen.getByRole('button', { name: 'Clear all stocks' }))

      expect(useStockStore.getState().selectedStocks).toHaveLength(0)
    })

    it('shows selected count label', () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA'] })
      render(<StockSearchSelector />)

      expect(screen.getByText('Selected Stocks (2/3)')).toBeInTheDocument()
    })
  })

  describe('3-stock limit enforcement', () => {
    it('disables input when 3 stocks are selected', () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA', 'GOOGL'] })
      render(<StockSearchSelector />)

      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('shows limit reached label when 3 stocks are selected', () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA', 'GOOGL'] })
      render(<StockSearchSelector />)

      expect(screen.getByText('(Limit reached)')).toBeInTheDocument()
    })

    it('shows max reached helper text when 3 stocks are selected', () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA', 'GOOGL'] })
      render(<StockSearchSelector />)

      expect(screen.getByText(/Maximum reached/)).toBeInTheDocument()
    })

    it('shows restricted placeholder when max is reached', () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA', 'GOOGL'] })
      render(<StockSearchSelector />)

      expect(
        screen.getByPlaceholderText('Remove a stock to add more')
      ).toBeInTheDocument()
    })

    it('does not add a 4th stock when max is reached', async () => {
      useStockStore.setState({ selectedStocks: ['AAPL', 'TSLA', 'GOOGL'] })
      render(<StockSearchSelector />)

      // Directly call addStock to verify the store enforces the limit
      useStockStore.getState().addStock('MSFT')
      expect(useStockStore.getState().selectedStocks).toHaveLength(3)
    })
  })

  describe('Duplicate prevention', () => {
    it('shows "Selected" indicator for already-selected stocks in dropdown', async () => {
      const user = userEvent.setup()
      useStockStore.setState({ selectedStocks: ['AAPL'] })
      render(<StockSearchSelector />)

      await user.type(screen.getByRole('textbox'), 'AAPL')

      await waitFor(() => {
        const aaplOption = screen.getAllByRole('option').find((o) =>
          o.textContent?.includes('AAPL')
        )
        expect(aaplOption?.textContent).toContain('Selected')
      })
    })

    it('does not add a duplicate stock', () => {
      useStockStore.setState({ selectedStocks: ['AAPL'] })

      useStockStore.getState().addStock('AAPL')
      expect(useStockStore.getState().selectedStocks).toHaveLength(1)
    })
  })

  describe('Dropdown close behavior', () => {
    it('closes the dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <StockSearchSelector />
          <div data-testid="outside">Outside</div>
        </div>
      )

      await user.type(screen.getByRole('textbox'), 'AAPL')
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      fireEvent.mouseDown(screen.getByTestId('outside'))
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    })
  })
})
