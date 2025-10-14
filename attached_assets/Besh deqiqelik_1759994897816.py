#!/usr/bin/env python3
import time
import requests
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import quote

# ================ CONFIG ================
BOT_TOKEN = ''
CHAT_ID = ''
RSI_PERIOD = 14
KLN_LIMIT = 500
MAX_WORKERS = 20
SLEEP_AFTER_BATCH = 1
MIN_INTERVAL = 300  # 5 dakika tekrar engeli
# ========================================

FAPI_BASE = "https://fapi.binance.com"

# --- Telegram ---
def send_telegram_message(text: str):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
        "disable_web_page_preview": True
    }
    try:
        requests.post(url, data=payload, timeout=8)
    except Exception as e:
        print("Telegram gönderme hatası:", e)

# --- Binance Futures USDT Perpetual ---
_SYMBOLS_CACHE = {"symbols": [], "ts": 0, "ttl": 300}

def fetch_fapi_exchange_info():
    try:
        r = requests.get(f"{FAPI_BASE}/fapi/v1/exchangeInfo", timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print("ExchangeInfo alma hatası:", e)
        return None

def get_usdt_perpetual_symbols():
    info = fetch_fapi_exchange_info()
    if not info or 'symbols' not in info:
        return []
    return [s['symbol'] for s in info['symbols']
            if s.get('quoteAsset') == 'USDT' and s.get('contractType') == 'PERPETUAL' and s.get('status') == 'TRADING']

def get_usdt_symbols_cached():
    now = time.time()
    if _SYMBOLS_CACHE['symbols'] and (now - _SYMBOLS_CACHE['ts'] < _SYMBOLS_CACHE['ttl']):
        return _SYMBOLS_CACHE['symbols']
    syms = get_usdt_perpetual_symbols()
    _SYMBOLS_CACHE['symbols'] = syms
    _SYMBOLS_CACHE['ts'] = now
    return syms

# --- Klines & RSI ---
def fetch_klines_binance(symbol: str, interval: str = "5m", limit: int = 200):
    try:
        r = requests.get(
            f"{FAPI_BASE}/fapi/v1/klines",
            params={"symbol": symbol, "interval": interval, "limit": limit},
            timeout=10
        )
        r.raise_for_status()
        data = r.json()
        df = pd.DataFrame(data, columns=[
            "open_time","open","high","low","close","volume",
            "close_time","qav","num_trades","taker_base_vol","taker_quote_vol","ignore"
        ])
        df['close'] = df['close'].astype(float)
        df['open_time'] = pd.to_datetime(df['open_time'], unit='ms', utc=True).dt.tz_convert('Asia/Baku')
        df['close_time'] = pd.to_datetime(df['close_time'], unit='ms', utc=True).dt.tz_convert('Asia/Baku')
        return df
    except Exception:
        return None

def rsi_wilder(series: pd.Series, period: int = RSI_PERIOD) -> pd.Series:
    delta = series.diff()
    gain = np.where(delta > 0, delta, 0.0)
    loss = np.where(delta < 0, -delta, 0.0)
    gain_ewm = pd.Series(gain).ewm(alpha=1/period, adjust=False).mean()
    loss_ewm = pd.Series(loss).ewm(alpha=1/period, adjust=False).mean()
    rs = gain_ewm / loss_ewm
    rsi = 100 - (100 / (1 + rs))
    return rsi

# --- TradingView link ---
TV_LINK_CACHE = {}

def validate_tradingview_link(symbol: str) -> str:
    """TradingView linkini oluşturur. Eğer sembolde '.P' yoksa ekler."""
    if symbol in TV_LINK_CACHE:
        return TV_LINK_CACHE[symbol]

    tv_symbol = symbol.upper()
    # Eğer sembolde zaten .P yoksa ekle
    if not tv_symbol.endswith(".P"):
        tv_symbol += ".P"

    tv_symbol = f":{tv_symbol}"
    link = f"https://www.tradingview.com/chart/?symbol={quote(tv_symbol)}"
    TV_LINK_CACHE[symbol] = link
    return link

# --- Coin gönderim zaman cache ---
COIN_SENT_CACHE = {}  # {symbol: last_sent_timestamp}

# --- Symbol processing ---
def process_symbol(symbol: str):
    now = time.time()
    if symbol in COIN_SENT_CACHE and (now - COIN_SENT_CACHE[symbol] < MIN_INTERVAL):
        return False

    df5 = fetch_klines_binance(symbol, "5m", limit=KLN_LIMIT)
    if df5 is None or len(df5) < RSI_PERIOD + 1:
        return False

    df5['rsi'] = rsi_wilder(df5['close'], RSI_PERIOD)
    rsi_now = float(df5['rsi'].iloc[-1])

    emoji = ""
    stars = ""
    signal_label = ""
    if rsi_now > 80:
        emoji = "🔴"
        signal_label = "SHORT RSI"
        if 80 < rsi_now <= 85:
            stars = "⭐"
        elif 85 < rsi_now <= 90:
            stars = "⭐⭐"
        else:
            stars = "⭐⭐⭐"
    elif rsi_now < 20:
        emoji = "🟢"
        signal_label = "LONG RSI"
        if 15 < rsi_now <= 20:
            stars = "⭐"
        elif 10 < rsi_now <= 15:
            stars = "⭐⭐"
        else:
            stars = "⭐⭐⭐"
    else:
        return False

    current_price = float(df5['close'].iloc[-1])
    previous_price = float(df5['close'].iloc[-2])
    boost = ((current_price - previous_price) / previous_price) * 100 if previous_price != 0 else 0.0

    # 1m ve 1h RSI
    rsi_1m = rsi_1h = 0.0
    d1 = fetch_klines_binance(symbol, "1m", limit=RSI_PERIOD+10)
    if d1 is not None and len(d1) >= RSI_PERIOD+1:
        d1['rsi'] = rsi_wilder(d1['close'], RSI_PERIOD)
        rsi_1m = float(d1['rsi'].iloc[-1])

    d1h = fetch_klines_binance(symbol, "1h", limit=RSI_PERIOD+10)
    if d1h is not None and len(d1h) >= RSI_PERIOD+1:
        d1h['rsi'] = rsi_wilder(d1h['close'], RSI_PERIOD)
        rsi_1h = float(d1h['rsi'].iloc[-1])

    binance_link = f"https://www.binance.com/en/futures/{symbol}"
    tradingview_link = validate_tradingview_link(symbol)

    message = (
        f"{emoji} #{symbol}{stars}\n"
        f"Market: Futures\n"
        f"Boost Value: {boost:+.2f}%\n"
        f"Current Price: {current_price}\n"
        f"Previous Price: {previous_price}\n"
        f"RSI: 1m.{rsi_1m:.2f} | 5m.{rsi_now:.2f} | 1h.{rsi_1h:.2f}\n"
        f"{signal_label}: {rsi_now:.2f}\n"
        f"[Binance]({binance_link}) | [TradingView]({tradingview_link})"
    )

    send_telegram_message(message)
    COIN_SENT_CACHE[symbol] = now
    return True

# --- Main Loop ---
def main_loop():
    while True:
        symbols = get_usdt_symbols_cached()
        if not symbols:
            print("❌ USDT perpetual sembolleri alınamadı, 10s sonra tekrar deneniyor...")
            time.sleep(10)
            continue

        total = len(symbols)
        print(f"\n📌 Toplam {total} aktif USDT perpetual sembol bulundu. Tarama başlıyor...")

        scanned = 0
        signals = 0
        start_time = time.time()

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {executor.submit(process_symbol, sym): sym for sym in symbols}
            for future in as_completed(futures):
                scanned += 1
                if future.result():
                    signals += 1

        elapsed = time.time() - start_time
        print(f"✅ Tarama tamamlandı. Toplam taranan coin: {scanned} | Gönderilen sinyal: {signals} | Süre: {elapsed:.1f}s")
        time.sleep(SLEEP_AFTER_BATCH)

if __name__ == "__main__":
    print("Binance Futures RSI Bot (USDT-M) başlatılıyor... (5m mumlar)")
    main_loop()
