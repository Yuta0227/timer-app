// // api/prefectures.ts
// import type { VercelRequest, VercelResponse } from '@vercel/node'
// import fetch from 'node-fetch'

// type ApiResponse = {
//   statusCode?: string
//   message: string | null
//   description?: string
//   result?: Prefectures[]
// }

// type Prefectures = {
//   prefCode: number
//   prefName: string
// }

// const API_URL = 'https://opendata.resas-portal.go.jp/api/v1/'

// const API_KEY = process.env.API_KEY ?? ''

// async function fetchPrefectures(): Promise<ApiResponse> {
//   const response = await fetch(`${API_URL}prefectures`, {
//     headers: {
//       'X-API-KEY': API_KEY,
//     },
//   })
//   const data = await response.json()
//   return data
// }

// export default async function (req: VercelRequest, res: VercelResponse) {
//   const result = await fetchPrefectures()
//   res.json(result)
// }