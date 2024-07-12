const ltuid_v2 = process.env.LTUID_V2
const ltoken_v2 = process.env.LTOKEN_V2
const cookie = `ltuid_v2=${ltuid_v2}; ltoken_v2=${ltoken_v2}`
const endpoint = 'https://sg-hk4e-api.hoyolab.com/event/sol/sign?act_id=e202102251931481'
const defaultLanguage = 'pt-pt'

async function main() {
  if (!cookie) throw new Error('Cookie não definido!')

  const url = new URL(endpoint)
  const actId = url.searchParams.get('act_id')

  url.searchParams.set('lang', defaultLanguage)

  try {
    const request = await fetch(url, {
      method: 'POST',
      headers: setHeaders(cookie),
      body: JSON.stringify({
        lang: defaultLanguage,
        act_id: actId,
      }),
    })
    const response = await request.json()

    handleResponse(response)
  } catch (err) {
    console.error(`[!] Resposta inesperada: ${err}`)
  }
}

function setHeaders(cookie) {
  const headers = new Headers()

  headers.set('accept', 'application/json, text/plain, */*')
  headers.set('accept-encoding', 'gzip, deflate, br, zstd')
  headers.set('accept-language', 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5')
  headers.set('connection', 'keep-alive')
  headers.set('origin', 'https://act.hoyolab.com')
  headers.set('referrer', 'https://act.hoyolab.com')
  headers.set('content-type', 'application/json;charset=UTF-8')
  headers.set('cookie', cookie)
  headers.set('sec-ch-ua', '"Not/A)Brand";v="8", "Chromium";v="126", "Brave";v="126"')
  headers.set('sec-ch-ua-mobile', '?0')
  headers.set('sec-ch-ua-platform', '"Linux"')
  headers.set('sec-fetch-dest', 'empty')
  headers.set('sec-fech-mode', 'cors')
  headers.set('sec-fetch-site', 'same-site')
  headers.set('sec-gpc', '1')
  headers.set('user-agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36')

  return headers
}

function handleResponse({ message, retcode }) {
  if (message === 'OK' || retcode === 0) return console.info(`[+] ${message}: Checkin feito com sucesso!`)
  if (message.includes('already') || retcode === -5003) {
    console.info(`[+] ${message}`)

    return process.exit(0)
  }
  if (message === 'Not logged in' || retcode === -100) return console.error(`[!] Erro ao logar: ${message}`)
}

const schedule = (cronTime, callbacks) => {
  const [minutes, hours, days, months, daysOfWeek] = cronTime.split(' ')
  const now = new Date()
  const nextRun = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours === '*' ? now.getHours() : parseInt(hours, 10),
    minutes === '*' ? now.getMinutes() : parseInt(minutes, 10),
    0
  )

  if (
    (days !== '*' && days !== String(now.getDate())) ||
    (months !== '*' && months !== String(now.getMonth() + 1)) ||
    (daysOfWeek !== '*' && daysOfWeek !== String(now.getDay()))
  ) nextRun.setDate(nextRun.getDate() + 1)

  if (nextRun !== now) return console.error(
    `[!] Ainda não é hora de fazer checkin! Você programou para ${nextRun.toLocaleDateString()} às ${nextRun.toLocaleTimeString()}`
  )

  const delay = nextRun.getTime() - now.getTime()

  setTimeout(() => {
    callbacks.forEach(async callback => await callback())
  }, delay)
}

schedule('10 13 * * *', [main])
