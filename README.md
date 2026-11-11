# LINGUA — Egyptian Live & Conversation Translator

## Dua mode
1. **Mode Live**: mendengarkan Amiyah Mesir (`ar-EG`) dan menerjemahkan ucapan yang dikenali ke bahasa Indonesia.
2. **Mode Percakapan**: terjemahan dua arah secara bergantian:
   - Tombol Orang Mesir: Amiyah Mesir → Indonesia.
   - Tombol Kamu: Indonesia → Arab.

## Menjalankan di VS Code (Windows)
1. Ekstrak ZIP.
2. Buka VS Code → File → Open Folder → pilih folder `LINGUA_LIVE_CONVERSATION`.
3. Install ekstensi **Live Server** jika belum ada.
4. Buka `index.html`, klik kanan → **Open with Live Server**.
5. Gunakan Chrome atau Edge terbaru.
6. Izinkan akses mikrofon saat browser meminta.
7. Pastikan internet aktif.

## Catatan akurasi dan privasi
- Pengenalan suara memakai Web Speech API browser. `ar-EG` meminta pengenalan Arab Mesir, tetapi browser tidak menjamin dapat mengenali semua kosakata, aksen, atau dialek Amiyah secara sempurna.
- Terjemahan memakai endpoint publik MyMemory tanpa API key. Layanan gratis dapat memiliki batas, jeda, atau gangguan. Hasil mungkin kurang tepat untuk slang, idiom, dan konteks percakapan.
- Mode Live menampilkan potongan ucapan setelah browser mengenalinya; bukan jaminan terjemahan simultan tanpa jeda.
- Mode Percakapan digunakan bergantian, bukan dua mikrofon yang aktif bersamaan.
- Jangan gunakan untuk informasi rahasia atau keputusan penting tanpa memeriksa kembali hasilnya.
- Mikrofon biasanya memerlukan `localhost` (Live Server) atau HTTPS; jangan hanya membuka HTML dengan klik dua kali.
