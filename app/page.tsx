import StockSearchSelector from '@/components/StockSearchSelector';
import DateRangePicker from '@/components/DateRangePicker';
import PriceTypeToggle from '@/components/PriceTypeToggle';
import LoadChartButton from '@/components/LoadChartButton';
import StockChart from '@/components/StockChart';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                StockPulse
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-0.5">
                Interactive Stock Price Charting for US Equities
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Chart Controls
          </h2>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-3">
              <StockSearchSelector />
            </div>

            <div className="lg:col-span-2">
              <DateRangePicker />
            </div>

            <div className="lg:col-span-1">
              <PriceTypeToggle />
            </div>
          </div>
        </div>

        <LoadChartButton />

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Price Chart
          </h2>
          <StockChart />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data provided by{' '}
            <a
              href="https://polygon.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Polygon.io
            </a>
            {' '}• Free tier includes 2 years of historical data
          </p>
        </div>
      </main>
    </div>
  );
}
