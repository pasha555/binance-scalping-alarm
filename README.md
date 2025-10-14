# Binance Scalping Alarm

## 🇹🇷 Türkçe Açıklama

**Binance Scalping Alarm**, Binance vadeli işlemler piyasasında RSI, MACD, hacim gibi teknik indikatörlere göre otomatik analiz yapan ve al/sat sinyalleri oluşturan bir web panelidir.

### 🚀 Özellikler
- RSI, MACD, hacim ve fiyat analizleri
- Otomatik sinyal üretimi (20 altı RSI -> AL, 80 üstü RSI -> SAT)
- Hacim filtresi (%0.2 altı coinler hariç)
- Gerçek zamanlı veri yenileme
- Modern ve responsive arayüz (Vite + TailwindCSS + TypeScript)
- Geliştirici dostu açık kaynak yapı

### 🔧 Kurulum
```bash
git clone https://github.com/pasha555/binance-scalping-alarm.git
cd binance-scalping-alarm
npm install
npm run dev
```
> `.env` dosyasına kendi Binance API anahtarlarını eklemeyi unutmayın.

### 💡 Katkıda Bulunma
Katkı yapmak isterseniz lütfen [CONTRIBUTING.md](./CONTRIBUTING.md) dosyasını inceleyin.

### 🪪 Lisans
Bu proje [MIT](./LICENSE) lisansı ile yayınlanmıştır.  
Yazar: **Pasha (pasha555)**

---

## 🇬🇧 English Description

**Binance Scalping Alarm** is a web-based dashboard that analyzes Binance Futures markets using technical indicators such as RSI, MACD, and volume, and generates buy/sell alerts.

### 🚀 Features
- RSI, MACD, volume & price analysis
- Auto signal generation (RSI < 20 = BUY, RSI > 80 = SELL)
- Volume filter (excludes coins below 0.2% volume)
- Real-time data updates
- Modern responsive UI (Vite + TailwindCSS + TypeScript)
- Developer-friendly open-source structure

### 🔧 Installation
```bash
git clone https://github.com/pasha555/binance-scalping-alarm.git
cd binance-scalping-alarm
npm install
npm run dev
```
> Don’t forget to add your Binance API keys to `.env` file.

### 💡 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### 🪪 License
This project is licensed under the [MIT License](./LICENSE).  
Author: **Pasha (pasha555)**
