import React, { useEffect, useState } from "react";
import {
  TextField, Button, Checkbox, FormControlLabel,
  Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, MenuItem, Select, IconButton, Chip, Avatar
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminPanel() {
  const [raporlar, setRaporlar] = useState([]);
  const [sorular, setSorular] = useState([]);
  const [yeniSoru, setYeniSoru] = useState({
    key: "",
    text: "",
    foto_zorunlu_cevap: "",
    aktif: true
  });
  const [duzenlenenSoru, setDuzenlenenSoru] = useState(null);

  // Backend URL (Environment üzerinden)
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchRaporlar();
    fetchSorular();
  }, []);

  async function fetchRaporlar() {
    const res = await fetch(`${API_URL}/api/kontroller`);
    const data = await res.json();
    setRaporlar(data);
  }

  async function fetchSorular() {
    const res = await fetch(`${API_URL}/api/sorular`);
    const data = await res.json();
    setSorular(data);
  }

  async function soruEkle() {
    const res = await fetch(`${API_URL}/api/sorular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(yeniSoru)
    });
    if (res.ok) {
      await fetchSorular();
      setYeniSoru({ key: "", text: "", foto_zorunlu_cevap: "", aktif: true });
    }
  }

  async function soruSil(id) {
    if (!window.confirm("Bu soruyu silmek istediğine emin misin?")) return;
    await fetch(`${API_URL}/api/sorular/${id}`, { method: "DELETE" });
    fetchSorular();
  }

  async function soruGuncelle() {
    const res = await fetch(`${API_URL}/api/sorular/${duzenlenenSoru.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(duzenlenenSoru)
    });
    if (res.ok) {
      setDuzenlenenSoru(null);
      fetchSorular();
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        ⚙️ Admin Panel
      </Typography>

      {/* ➕ Yeni Soru Ekleme */}
      <Paper style={{ padding: 20, marginBottom: 30 }}>
        <Typography variant="h6" gutterBottom>
          ➕ Yeni Soru Ekle
        </Typography>
        <TextField
          label="Key (ör: lastik)"
          value={yeniSoru.key}
          onChange={(e) => setYeniSoru({ ...yeniSoru, key: e.target.value })}
          fullWidth
          style={{ marginBottom: 15 }}
        />
        <TextField
          label="Soru Metni"
          value={yeniSoru.text}
          onChange={(e) => setYeniSoru({ ...yeniSoru, text: e.target.value })}
          fullWidth
          style={{ marginBottom: 15 }}
        />
        <Select
          value={yeniSoru.foto_zorunlu_cevap}
          onChange={(e) =>
            setYeniSoru({ ...yeniSoru, foto_zorunlu_cevap: e.target.value })
          }
          fullWidth
          displayEmpty
          style={{ marginBottom: 15 }}
        >
          <MenuItem value="">
            <em>Zorunlu değil</em>
          </MenuItem>
          <MenuItem value="evet">Evet</MenuItem>
          <MenuItem value="hayir">Hayır</MenuItem>
        </Select>
        <FormControlLabel
          control={
            <Checkbox
              checked={yeniSoru.aktif}
              onChange={(e) =>
                setYeniSoru({ ...yeniSoru, aktif: e.target.checked })
              }
            />
          }
          label="Aktif"
        />
        <br />
        <Button
          variant="contained"
          color="primary"
          onClick={soruEkle}
          style={{ marginTop: 10 }}
        >
          Kaydet
        </Button>
      </Paper>

      {/* 📋 Mevcut Sorular */}
      <Typography variant="h6" gutterBottom>
        📋 Mevcut Sorular
      </Typography>
      <TableContainer component={Paper} style={{ marginBottom: 30 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Key</b></TableCell>
              <TableCell><b>Soru Metni</b></TableCell>
              <TableCell><b>Foto Zorunlu Cevap</b></TableCell>
              <TableCell><b>Aktif</b></TableCell>
              <TableCell><b>İşlemler</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorular.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell>{s.key}</TableCell>
                <TableCell>{s.text}</TableCell>
                <TableCell>{s.foto_zorunlu_cevap || "Zorunlu değil"}</TableCell>
                <TableCell>{s.aktif ? "✅" : "❌"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => setDuzenlenenSoru(s)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => soruSil(s.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ✏️ Düzenleme Formu */}
      {duzenlenenSoru && (
        <Paper style={{ padding: 20, marginTop: 20 }}>
          <Typography variant="h6" gutterBottom>
            ✏️ Soru Düzenle
          </Typography>
          <TextField
            label="Key"
            value={duzenlenenSoru.key}
            onChange={(e) =>
              setDuzenlenenSoru({ ...duzenlenenSoru, key: e.target.value })
            }
            fullWidth
            style={{ marginBottom: 15 }}
          />
          <TextField
            label="Soru Metni"
            value={duzenlenenSoru.text}
            onChange={(e) =>
              setDuzenlenenSoru({ ...duzenlenenSoru, text: e.target.value })
            }
            fullWidth
            style={{ marginBottom: 15 }}
          />
          <Select
            value={duzenlenenSoru.foto_zorunlu_cevap || ""}
            onChange={(e) =>
              setDuzenlenenSoru({ ...duzenlenenSoru, foto_zorunlu_cevap: e.target.value })
            }
            fullWidth
            displayEmpty
            style={{ marginBottom: 15 }}
          >
            <MenuItem value="">
              <em>Zorunlu değil</em>
            </MenuItem>
            <MenuItem value="evet">Evet</MenuItem>
            <MenuItem value="hayir">Hayır</MenuItem>
          </Select>
          <FormControlLabel
            control={
              <Checkbox
                checked={duzenlenenSoru.aktif}
                onChange={(e) =>
                  setDuzenlenenSoru({ ...duzenlenenSoru, aktif: e.target.checked })
                }
              />
            }
            label="Aktif"
          />
          <br />
          <Button
            variant="contained"
            color="success"
            onClick={soruGuncelle}
            style={{ marginRight: 10 }}
          >
            Kaydet
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setDuzenlenenSoru(null)}
          >
            İptal
          </Button>
        </Paper>
      )}

      {/* 📑 Raporlar */}
      <Typography variant="h6" gutterBottom style={{ marginTop: 40 }}>
        📑 Raporlar
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>Plaka</b></TableCell>
              <TableCell><b>Tarih</b></TableCell>
              <TableCell><b>Sonuçlar</b></TableCell>
              <TableCell><b>Fotoğraflar</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {raporlar.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.plaka}</TableCell>
                <TableCell>{new Date(r.tarih).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    label={`Lastik: ${r.lastik ? "✅" : "❌"}`}
                    color={r.lastik ? "success" : "error"}
                    style={{ marginRight: 5 }}
                  />
                  <Chip
                    label={`Cam: ${r.cam ? "✅" : "❌"}`}
                    color={r.cam ? "success" : "error"}
                    style={{ marginRight: 5 }}
                  />
                  <Chip
                    label={`Hasar: ${r.hasar ? "✅" : "❌"}`}
                    color={r.hasar ? "error" : "success"}
                    style={{ marginRight: 5 }}
                  />
                  <Chip
                    label={`Far: ${r.far ? "✅" : "❌"}`}
                    color={r.far ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  {r.fotolar &&
                    r.fotolar.map((url, idx) => (
                      <Avatar
                        key={idx}
                        alt={`Foto ${idx + 1}`}
                        src={`http://localhost:5000${url}`}
                        sx={{ width: 56, height: 56, marginRight: 1 }}
                        component="a"
                        href={`http://localhost:5000${url}`}
                        target="_blank"
                      />
                    ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
