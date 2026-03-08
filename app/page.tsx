import StockSearchSelector from '@/components/StockSearchSelector';
import DateRangePicker from '@/components/DateRangePicker';
import PriceTypeToggle from '@/components/PriceTypeToggle';
import LoadChartButton from '@/components/LoadChartButton';
import StockChart from '@/components/StockChart';

export default function Home() {
  return (
    <div className="min-h-screen bg-ctp-base">
      <header className="bg-ctp-mantle border-b border-ctp-surface0 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-ctp-mauve to-ctp-blue">
                <svg
                  className="w-6 h-6 stroke-ctp-base"
                  fill="none"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-ctp-text">
                Stock<span className="text-ctp-mauve">Pulse</span>
              </h1>
              <p className="text-sm sm:text-base mt-0.5 text-ctp-subtext0">
                Interactive Stock Price Charting for US Equities
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-ctp-mantle rounded-xl shadow-2xl border border-ctp-surface0 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-6 text-ctp-text">
            <span className="text-ctp-blue">▸</span> Chart Controls
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

        <div className="bg-ctp-mantle rounded-xl shadow-2xl border border-ctp-surface0 p-6">
          <h2 className="text-lg font-semibold mb-6 text-ctp-text">
            <span className="text-ctp-sapphire">▸</span> Price Chart
          </h2>
          <StockChart />
        </div>

        <div className="mt-8 text-center text-sm text-ctp-overlay1">
          <p>
            Data provided by{' '}
            <a
              href="https://polygon.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ctp-blue underline transition-colors hover:opacity-80"
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
