import { fetch } from "cross-fetch"

export const getResponse = async (url: string) => {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}