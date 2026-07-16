# DOKUMEN PERSYARATAN PRODUK (PRD)
## Nama Proyek: Theory of the Soul (TOTS) — Immersive Maze Game (Cora UI Edition)
**Versi:** 1.1.0  
**Desainer/Pengembang:** AI Coding Assistant & Sividelia_okuni6  
**Platform Target:** Web (Responsive Desktop & Mobile)  
**Tujuan Dokumen:** Panduan Spesifikasi Produk, Implementasi Audio Prosedural, dan Blueprint Desain Figma (Cora UI Style)

---

## 1. Ringkasan Proyek & Filosofi Desain
**Theory of the Soul (TOTS)** adalah sebuah game maze web interaktif bernuansa atmosferik-kontemplatif. Berbeda dengan game berlatar gelap konvensional, TOTS mengadopsi bahasa visual **Cora UI**:
*   **Tema Utama:** Light Theme (Terang, tenang, lapang).
*   **Kanvas Atmosferik:** Memadukan lukisan langit plein-air romantis penuh awan kumulus cerah sebagai latar belakang penuh (full-bleed viewport) dengan antarmuka meja kerja (desk interface) presisi di atasnya. UI terasa seperti diletakkan dengan tenang di atas jendela kaca yang menghadap langsung ke langit bebas.
*   **Tipografi Sastra:** Serif ringan sebagai penanda emosional yang berbisik lembut, dipadukan dengan Sans fungsional untuk membaca data mekanis secara jernih.
*   **Minimalisme Warna:** Palet dijaga sesederhana mungkin agar lukisan langit dan keindahan tipografi yang bekerja menyentuh perasaan pemain.

---

## 2. Fitur Utama & Spesifikasi Fungsional

### A. Modul Onboarding & Lore Kontemplatif
*   **Naratif Interaktif:** Halaman pembuka menampilkan cerita lore singkat berlatar belakang langit awan mengalir lembut.
*   **Pilihan Bahasa (i18n):** Mendukung pergantian bahasa dinamis (English, Bahasa Indonesia, Mandarin, Prancis) yang persisten menggunakan `localStorage`.
*   **Inisialisasi Nama Pemain:** Form pengisian nama maksimal 18 karakter untuk dicatat di papan peringkat blockchain simulasi.

### B. Mekanik Labirin Dinamis (Maze Board)
*   **Grid-Based Movement:** Navigasi karakter yang responsif menggunakan Keyboard (Arrow / WASD) dan D-Pad on-screen yang ramah seluler.
*   **Umpan Balik Auditori Real-time:** Setiap langkah kaki (*footstep*), tabrakan dinding (*collision*), pengumpulan gas, dan pengaktifan validator node menghasilkan sintesis suara unik dari Sound Engine.

### C. Sound Engine Canggih (The Audio Core)
*   **Sintesis Prosedural & File MP3:** Sound Engine mengintegrasikan Web Audio API untuk SFX sintesis real-time (Oscillator, Gain, Filter) untuk melahirkan suasana misterius-elektronik, dipadukan pemutaran file musik latar MP3 eksternal.
*   **Auto-Play & Browser Compliance:** Sesuai kebijakan keamanan browser modern, musik diinisialisasi otomatis setelah interaksi klik/sentuh pertama dari pemain di layar manapun.
*   **Sistem Cross-Fade Audio:** Transisi hidup/mati musik menggunakan kurva amplifikasi linear halus selama **1.0 detik** (`linearRampToValueAtTime`) untuk mencegah jeda audio kasar yang mengejutkan telinga.
*   **Loop Tanpa Henti:** Musik tema diprogram untuk terus mengulang (*infinite loop*) secara otomatis hingga pemain secara aktif menekan tombol mute.

### D. Papan Peringkat (Leaderboard) & Badges
*   **TPS-Based Scoring:** Kecepatan dihitung presisi berdasarkan waktu penyelesaian serta throughput transaksi simulasi (TPS - Transactions Per Second).
*   **Badge Pencapaian:** Sistem badge pencapaian (seperti *Speedster*, *Gas Optimizer*, *Wall Breaker*) yang terbuka otomatis saat kondisi tertentu terpenuhi dan tersimpan aman di `localStorage`.

---

## 3. Token Desain Visual (Panduan Figma Cora UI)

Gunakan daftar token dan spesifikasi ini sebagai dasar pembuatan mockup dan library komponen Anda di Figma:

### A. Token Warna (Cora Palette)
| Nama Warna | Nilai Hex | Peran Visual |
| :--- | :--- | :--- |
| **Cerulean Sky** | `#117bc8` | Warna langit romantis, aksen navigasi aktif, & visual soundwave. |
| **Deep Navy** | `#061d33` | Warna teks utama, tombol tindakan utama, & outline struktur. |
| **Warm Red** | `#c83c2a` | Aksen stempel segel, indikator gas/error, & branding utama TOTS. |
| **Cloud White** | `#f7fafd` | Background card semi-transparan & warna dasar penunjang. |
| **Ink Dark** | `#061d33` | Konten tipografi & elemen data monospace presisi. |

### B. Spesifikasi Tipografi (Typography Pairings)
1.  **Display / Headings (Judul Utama, Judul Level):**
    *   **Font:** *Cormorant Garamond* (Serif)
    *   **Style:** Light / Regular, Italic untuk kata-kata penekanan emosional khusus.
    *   **Sifat:** Menimbulkan kesan puitis, literatur klasik, dan berbisik tenang.
2.  **Interface / Body Text (Deskripsi, Tombol, Form):**
    *   **Font:** *Plus Jakarta Sans* atau *Switzer* (Sans-serif)
    *   **Style:** Regular (400) / Semi-bold (600).
    *   **Sifat:** Bersih, fungsional, keterbacaan tinggi di layar kecil.
3.  **Technical Data (Timer, TPS, Gas, Block Height):**
    *   **Font:** *JetBrains Mono* (Monospace)
    *   **Style:** Medium / Bold.
    *   **Sifat:** Brutalist, presisi teknis, mirip dengan terminal atau struk transaksi.

### C. Struktur Layout Komponen (Cora Desk Card)
Semua panel UI melayang di atas lukisan langit dengan gaya **Cora Desk Card**:
*   **Latar Belakang Card:** `rgba(244, 248, 251, 0.82)`
*   **Efek Kaca (Backdrop Blur):** `blur(12px) saturate(140%)`
*   **Garis Tepi (Border):** `1px solid rgba(6, 29, 51, 0.08)`
*   **Efek Kedalaman (Box Shadow):**
    *   Shadow luar: `0 10px 40px -10px rgba(6, 29, 51, 0.12)`
    *   Highlight dalam (Top Lip): `inset 0 1px 0 rgba(255, 255, 255, 0.6)` untuk menangkap bias cahaya atas.

---

## 4. Struktur Folder & Aset Proyek (Untuk Diunduh)

Jika Anda ingin mengunduh kode aplikasi atau memasukkan aset asli ke dalam Figma, berikut adalah peta lokasinya:

### A. Lokasi File Utama:
*   `/src/components/SoundEngine.ts` — Berisi logika sintesis audio, osilator, filter, dan sistem cross-fade musik MP3.
*   `/src/components/MazeBoard.tsx` — Komponen papan permainan labirin, render grid canvas, item gas, dan validator node.
*   `/src/components/Leaderboard.tsx` — Layar papan peringkat terintegrasi dengan tabel skor dan showcase pencapaian lencana.
*   `/src/components/Onboarding.tsx` — Form intro pembuka,lore cerita, dan panduan dasar permainan.
*   `/src/index.css` — Tempat konfigurasi variabel CSS, keyframes animasi, dan utility class Cora UI.
*   `/src/lib/i18n.ts` — Pemetaan data multibahasa (lokalisasi) teks permainan.

### B. Aset Visual yang Bisa Diunduh / Digunakan di Figma:
*   **Lukisan Langit Utama (Cora Viewport Background):**  
    Lokasi file: `/src/assets/images/sky_canvas_1784092998984.jpg`  
    *Lukisan pemandangan langit romantis dengan awan kumulus indah yang melandasi seluruh halaman permainan.*
*   **Musik Tema / Backsound:**  
    Pemain bisa meletakkan file musik latar bertipe `.mp3` pilihan mereka di direktori `/public/` dengan nama `bg_music.mp3` untuk menggantikan track default.

---

## 5. Alur Pengalaman Pengguna (UX Flow)
1.  **Tahap 1: Kontemplasi (Onboarding)**  
    Pemain disambut pemandangan langit biru romantis. Teks literatur membisikkan kisah *Theory of the Soul*. Pemain memasukkan nama dan memilih bahasa. Musik ambient MP3 mulai fade-in secara lembut pada ketukan pertama.
2.  **Tahap 2: Navigasi Tenang (Home Menu & Pilihan Level)**  
    Pemain memilih mode permainan (*Campaign 1-50 Levels* atau *Classic Single Speedrun*). Semua kartu pilihan terbuat dari kaca semi-transparan dengan bias cahaya yang indah di atas langit.
3.  **Tahap 3: Permainan Presisi (Maze Gameplay)**  
    Labirin dirender di atas meja kaca. Tiap pergerakan memicu feedback visual dan audio prosedural yang syahdu. Timer menghitung mundur atau maju dengan detail TPS.
4.  **Tahap 4: Konfirmasi Validasi (Penyelesaian & Skor)**  
    Saat mencapai validator node akhir, game mensintesis bebunyian kemenangan yang megah. Skor dikirim ke database lokal, mendaftarkan pencapaian di Leaderboard beserta badge khusus.

