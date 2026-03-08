import { http, HttpResponse } from 'msw'

const BASE_URL = 'http://localhost:3000'

export const handlers = [
  http.get(`${BASE_URL}/api/stocks/aggregates`, ({ request }) => {
    const url = new URL(request.url)
    const symbols = url.searchParams.get('symbols')?.split(',') || []
    const from = url.searchParams.get('from')
    const to = url.searchParams.get('to')

    if (!symbols.length || !from || !to) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Missing required parameters',
        },
        { status: 400 }
      )
    }

    const mockData: Record<string, any> = {}
    symbols.forEach((symbol) => {
      mockData[symbol] = [
        {
          t: new Date('2024-01-01').getTime(),
          o: 100,
          h: 110,
          l: 95,
          c: 105,
          v: 1000000,
        },
        {
          t: new Date('2024-01-02').getTime(),
          o: 105,
          h: 115,
          l: 100,
          c: 110,
          v: 1100000,
        },
        {
          t: new Date('2024-01-03').getTime(),
          o: 110,
          h: 120,
          l: 105,
          c: 115,
          v: 1200000,
        },
      ]
    })

    return HttpResponse.json({
      success: true,
      data: mockData,
    })
  }),
]

export const errorHandlers = [
  http.get(`${BASE_URL}/api/stocks/aggregates`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }),
]

export const rateLimitHandlers = [
  http.get(`${BASE_URL}/api/stocks/aggregates`, () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Rate limit exceeded',
      },
      {
        status: 429,
        headers: {
          'X-Rate-Limit-Wait': '60000',
          'Retry-After': '60',
        },
      }
    )
  }),
]
