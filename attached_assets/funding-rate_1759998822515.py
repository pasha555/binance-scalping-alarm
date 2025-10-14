# -*- coding: utf-8 -*-
import asyncio
import time
import aiohttp
			   
from telegram import Bot
from datetime import datetime
from urllib.parse import quote

# === Telegram Settings ===
TELEGRAM_BOT_TOKEN = ''
TELEGRAM_CHAT_ID = ''
bot = Bot(token=TELEGRAM_BOT_TOKEN)

# === Funding Rate Thresholds ===
MIN_THRESHOLD = 1   # percent
MAX_THRESHOLD = 2   # percent

								  

							
				 

# === Sent coins tracker (avoid spamming) ===
sent_symbols = {}  # {symbol: last_sent_timestamp}
		
																	
							
															
						  
											   
					

# === Logging function ===
def log(msg):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}")

# === Fetch Binance Futures Funding Rates ===
async def get_funding_rates():
    # Yedekli endpoint listesi (bazi IP’lerde farkli node çalisir)
    urls = [
        'https://fapi.binance.com/fapi/v1/premiumIndex',
        'https://fapi1.binance.com/fapi/v1/premiumIndex',
        'https://fapi2.binance.com/fapi/v1/premiumIndex',
        'https://fapi3.binance.com/fapi/v1/premiumIndex'
    ]
											
						  
												 
				 

    # Tarayici kimligine benzer headerlar (bot engelini asar)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/129.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Referer": "https://www.binance.com/",
        "Origin": "https://www.binance.com",
    }

    # Her endpoint’i sirayla dene, 200 döneni kullan
    for url in urls:
        try:
            async with aiohttp.ClientSession(headers=headers) as session:
                async with session.get(url, ssl=False, timeout=15) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        log(f"?? {url} returned status {response.status}")
        except Exception as e:
            log(f"Error fetching from {url}: {e}")
    return []

# === Funding rate validation ===
def is_valid_funding_rate(rate):
    try:
        rate_percent = float(rate) * 100
        return (MIN_THRESHOLD <= rate_percent <= MAX_THRESHOLD) or (-MAX_THRESHOLD <= rate_percent <= -MIN_THRESHOLD)
    except:
        return False

# === Send Telegram message ===
async def send_funding_message(symbol, rate):
    rate_percent = round(float(rate) * 100, 4)

    # ???? yön belirleme
    direction_emoji = "??" if rate_percent > 0 else "??"

    binance_link = f"https://www.binance.com/en/futures/{symbol}"
    tradingview_link = f"https://www.tradingview.com/chart/?symbol={quote(f'BINANCE:{symbol}')}"

    message = (
        f"{direction_emoji} #{symbol}\n"
								 
        f"Boost Value: *{rate_percent}%*\n"
        f"[?? Binance]({binance_link}) | [?? TradingView]({tradingview_link})"
    )

    try:
        await bot.send_message(
            chat_id=TELEGRAM_CHAT_ID,
            text=message,
            parse_mode='Markdown',
            disable_web_page_preview=True
        )
        log(f"? Message sent: {symbol} ({rate_percent}%)")
    except Exception as e:
        log(f"Error sending Telegram message for {symbol}: {e}")

# === Main loop ===
async def main():
    total_messages_sent = 0
    while True:
        try:
							   
											   
							 
																			  
			
            data = await get_funding_rates()
            total_coins = len(data)
            matches = 0
            log(f"{total_coins} coins checking funding rates...")

            now = time.time()

            for item in data:
                symbol = item.get('symbol')
                rate = item.get('lastFundingRate')

                if symbol is None or rate is None:
                    continue

										  
												   
							

                if is_valid_funding_rate(rate):
                    last_time = sent_symbols.get(symbol, 0)
                    if now - last_time > 3600:  # 1 hour cooldown per coin
                        await send_funding_message(symbol, rate)
                        sent_symbols[symbol] = now
                        total_messages_sent += 1
                        matches += 1
																						

            log(f"?? Cycle completed: {matches} matches, total messages sent: {total_messages_sent}\n")
            await asyncio.sleep(60)

        except Exception as e:
            log(f"? Error in main loop: {e}")
            await asyncio.sleep(60)

# === Entry point ===
if __name__ == '__main__':
    log("?? Binance Futures Funding Rate Bot started...")
    asyncio.run(main())
