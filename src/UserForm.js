import React, { useEffect, useState, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

export default function UserForm() {
  // --- QR + plaka ---
  const [plaka, setPlaka] = useState("");
  const [qrAcik, setQrAcik] = useState(false);
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const readerRef = useRef(null);

  // --- Soru akışı ---
  const [sorular, setSorular] = useState([]);
  const [cevaplar, setCevaplar] = useState({});
  const [foto, setFoto] = useState({});
  const [step, setStep] = useState(0);
  const fileInputRef = useRef(null);

  // Backend URL (Environment üzerinden)
  const API_URL = process.env.REACT_APP_API_URL;


  // Soruları çek
  useEffect(() => {
    fetchSorular();
  }, []);

  async function fetchSorular() {
    try {
      const res = await fetch(`${API_URL}/api/sorular`);
      const data = await res.json();
      setSorular(data.filter((s) => s.aktif));
    } catch (err) {
      console.error("Sorular yüklenemedi:", err);
      alert("Backend'e bağlanılamıyor. Lütfen tekrar deneyin.");
    }
  }

  // ZXing ile QR başlat/durdur
  useEffect(() => {
    if (!qrAcik) {
      if (controlsRef.current) {
        try { controlsRef.current.stop(); } catch (_) {}
        controlsRef.current = null;
      }
      return;
    }

    readerRef.current = new BrowserQRCodeReader();
    let stopped = false;

    (async () => {
      try {
        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const back = devices.find((d) => /back|rear|environment/i.test(d.label));
        const deviceId = back?.deviceId || devices[devices.length - 1]?.deviceId || undefined;

        readerRef.current.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err, controls) => {
            if (!controlsRef.current) controlsRef.current = controls;
            if (result && !stopped) {
              setPlaka(result.getText());
              setQrAcik(false);
            }
          }
        );
      } catch (e) {
        console.error("QR başlatma hatası:", e);
        alert("Kamera açılırken bir sorun oluştu. Lütfen izin verdiğinizden emin olun.");
        setQrAcik(false);
      }
    })();

    return () => {
      stopped = true;
      if (controlsRef.current) {
        try { controlsRef.current.stop(); } catch (_) {}
        controlsRef.current = null;
      }
    };
  }, [qrAcik]);

  function handleFoto(key, file) {
    setFoto({ ...foto, [key]: file });
  }

  async function handleSubmit() {
    const formData = new FormData();
    formData.append("plaka", plaka);

    sorular.forEach((soru) => {
      formData.append(soru.key, cevaplar[soru.key] || "");
      if (foto[soru.key]) {
        formData.append("foto", foto[soru.key]);
      }
    });

    try {
      const res = await fetch(`${API_URL}/api/kontroller-foto`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("✅ Rapor başarıyla kaydedildi!");
        setStep(0);
        setCevaplar({});
        setFoto({});
        setPlaka("");
      } else {
        const t = await res.text().catch(() => "");
        alert("❌ Hata oluştu:\n" + t);
      }
    } catch (err) {
      console.error("Kayıt gönderilemedi:", err);
      alert("Backend'e ulaşılamadı.");
    }
  }

  if (sorular.length === 0) return <p>Sorular yükleniyor...</p>;

  // plaka yoksa önce QR ekranı
  if (!plaka) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "5%",
          background: "#eceff1",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: 20,
            maxWidth: 600,
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: 16 }}>📷 Plaka Tara</h2>

          {!qrAcik ? (
            <button
              style={{
                fontSize: 24,
                padding: "16px 24px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                width: "80%",
              }}
              onClick={() => setQrAcik(true)}
            >
              QR Kod Tara
            </button>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                <video
                  ref={videoRef}
                  style={{ width: "100%", maxWidth: 420, borderRadius: 12, border: "1px solid #ccc" }}
                  playsInline
                  muted
                />
              </div>
              <button
                style={{
                  marginTop: 12,
                  fontSize: 18,
                  padding: "10px 18px",
                  backgroundColor: "#9e9e9e",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                }}
                onClick={() => setQrAcik(false)}
              >
                Kapat
              </button>
            </>
          )}

          <p style={{ marginTop: 16, color: "#666" }}>
            * Mobilde kameranın çalışması için HTTPS gerekir (ngrok ile açtınsa sorun yok). Kamera iznini verdiğinden emin ol.
          </p>
        </div>
      </div>
    );
  }

  // plaka var: soru akışı
  const soru = sorular[step];
  const cevap = cevaplar[soru.key] || "";
  const fotoZorunlu =
    soru.foto_zorunlu_cevap &&
    cevap &&
    cevap.toLowerCase() === soru.foto_zorunlu_cevap.toLowerCase();

  function handleCevapAndNext(value) {
    const yeniCevaplar = { ...cevaplar, [soru.key]: value };
    setCevaplar(yeniCevaplar);

    if (soru.foto_zorunlu_cevap && value.toLowerCase() === soru.foto_zorunlu_cevap.toLowerCase()) {
      return; // foto zorunlu ise önce foto bekle
    }

    if (step < sorular.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "5%",
        background: "#eceff1",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Üst Logo */}
        <div style={{ marginBottom: 20 }}>
          <img
            src="/logo.png"
            alt="Firma Logosu"
            style={{ maxWidth: "300px", height: "auto", marginTop: 100 }}
          />
        </div>

        {/* Plaka bilgisi */}
        <div style={{ marginBottom: 10, color: "#333" }}>
          <b>Plaka:</b> {plaka}
        </div>

        {/* Soru ve Butonlar */}
        <div>
          <h2 style={{ fontSize: 32, marginBottom: 40 }}>
            {step + 1}/{sorular.length} - {soru.text}
          </h2>

          <div>
            <button
              style={{
                fontSize: 32,
                padding: "30px 60px",
                margin: "15px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "12px",
                width: "80%",
              }}
              onClick={() => handleCevapAndNext("evet")}
            >
              ✅ EVET
            </button>
            <button
              style={{
                fontSize: 32,
                padding: "30px 60px",
                margin: "15px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "12px",
                width: "80%",
              }}
              onClick={() => handleCevapAndNext("hayir")}
            >
              ❌ HAYIR
            </button>
          </div>

          {/* Fotoğraf yükleme (zorunluysa) */}
          {cevap && fotoZorunlu && (
            <div style={{ marginTop: 30 }}>
              <p style={{ fontSize: 24, marginBottom: 20 }}>
                📷 Bu cevaba fotoğraf yüklemek zorunludur:
              </p>
              <button
                style={{
                  fontSize: 28,
                  padding: "20px 40px",
                  backgroundColor: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                  width: "80%",
                }}
                onClick={() => fileInputRef.current.click()}
              >
                📸 Fotoğraf Seç
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  handleFoto(soru.key, e.target.files[0]);
                  if (step < sorular.length - 1) {
                    setStep(step + 1);
                  } else {
                    handleSubmit();
                  }
                }}
              />
              {foto[soru.key] && (
                <p style={{ fontSize: 20, marginTop: 10, color: "green" }}>
                  ✅ {foto[soru.key].name} yüklendi
                </p>
              )}
            </div>
          )}

          {/* Geri Butonu */}
          {step > 0 && (
            <div style={{ marginTop: 50 }}>
              <button
                style={{
                  fontSize: 28,
                  padding: "25px 60px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  width: "80%",
                }}
                onClick={() => setStep(step - 1)}
              >
                ⬅️ Geri
              </button>
            </div>
          )}
        </div>

        {/* Alt Logo */}
        <div style={{ marginTop: 10 }}>
          <img
            src="/logo_bt.png"
            alt="Alt Logo"
            style={{ maxWidth: "250px", height: "auto" }}
          />
        </div>
      </div>
    </div>
  );
}




